import { Request, Response } from 'express';
import { db } from '../db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export function getProblems(req: Request, res: Response): void {
  try {
    const { search, difficulty, category, language, solved, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;

    let problems = db.problems.find();

    // 1. Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // 2. Difficulty filter
    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      problems = problems.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // 3. Category filter
    if (category && typeof category === 'string' && category !== 'All') {
      problems = problems.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // 4. Language filter
    if (language && typeof language === 'string' && language !== 'All') {
      problems = problems.filter((p) =>
        p.supportedLanguages.some((lang) => lang.toLowerCase() === language.toLowerCase())
      );
    }

    // Calculate total count before pagination
    const totalCount = problems.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = problems.slice(startIndex, startIndex + limitNum);

    // Sanitize test cases (exclude hidden test cases from list)
    const sanitized = paginated.map((p) => {
      const { testCases, ...safeProb } = p;
      return {
        ...safeProb,
        totalTestCases: testCases.length,
      };
    });

    res.status(200).json({
      problems: sanitized,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching problems.' });
  }
}

export function getDailyProblem(req: Request, res: Response): void {
  try {
    const allProblems = db.problems.find();
    if (allProblems.length === 0) {
      res.status(404).json({ message: 'No challenges found in database.' });
      return;
    }

    const forceRandom = req.query.random === 'true' || req.query.force === 'true';

    // 1. Check for problems currently designated as daily challenge in database
    let designatedProblems = allProblems.filter(
      (p) => p.isDaily === true || p.isDailyChallenge === true
    );

    let chosenDaily: any = null;

    if (forceRandom || designatedProblems.length === 0) {
      // Pick a single random problem from the database and designate it
      const randomIndex = Math.floor(Math.random() * allProblems.length);
      const selected = allProblems[randomIndex];

      // Remove previous daily designations if forcing new random
      if (forceRandom && designatedProblems.length > 0) {
        for (const prev of designatedProblems) {
          db.problems.updateById(prev.id, { isDaily: false, isDailyChallenge: false });
        }
      }

      // Designate selected problem as daily challenge in the database
      const updated = db.problems.updateById(selected.id, {
        isDaily: true,
        isDailyChallenge: true,
        designatedDailyAt: new Date().toISOString(),
      });

      chosenDaily = updated || selected;
    } else {
      // Fetch a single random problem designated as the 'daily challenge' from the database
      const randomIndex = Math.floor(Math.random() * designatedProblems.length);
      chosenDaily = designatedProblems[randomIndex];
    }

    const { testCases, ...safeDaily } = chosenDaily;
    const sampleTestCases = (testCases || []).filter((tc: any) => !tc.isHidden);
    const totalTestCases = (testCases || []).length;

    const payload = {
      ...safeDaily,
      isDaily: true,
      isDailyChallenge: true,
      sampleTestCases,
      totalTestCases,
    };

    res.status(200).json({
      success: true,
      problem: payload,
      ...payload,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching daily challenge.' });
  }
}

export function getProblemById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const problem = db.problems.findById(id) || db.problems.findOne((p) => p.slug === id);

    if (!problem) {
      res.status(404).json({ message: `Challenge with identifier "${id}" not found.` });
      return;
    }

    // Expose only public test cases
    const publicTestCases = problem.testCases.filter((tc) => !tc.isHidden);

    res.status(200).json({
      problem: {
        ...problem,
        testCases: publicTestCases,
        totalTestCases: problem.testCases.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching challenge details.' });
  }
}
