import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Flame,
  Zap,
  Trophy,
  CheckCircle2,
  Calendar,
  Github,
  Mail,
  Edit2,
  Award,
  Check,
  Shield,
} from 'lucide-react';
import { api } from '../services/api';
import { User, Achievement } from '../types';

interface ProfileViewProps {
  currentUser: User;
  onUserUpdate: (updated: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUserUpdate }) => {
  const [profile, setProfile] = useState<User>(currentUser);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Edit modal
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(currentUser.name);
  const [editBio, setEditBio] = useState<string>(currentUser.bio || '');
  const [editGithub, setEditGithub] = useState<string>(currentUser.githubUrl || '');
  const [editAvatar, setEditAvatar] = useState<string>(currentUser.profileImage);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.getProfile();
        if (res.user) {
          setProfile(res.user);
          setAchievements(res.user.achievements || []);
          setEditName(res.user.name);
          setEditBio(res.user.bio || '');
          setEditGithub(res.user.githubUrl || '');
          setEditAvatar(res.user.profileImage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        name: editName,
        bio: editBio,
        githubUrl: editGithub,
        profileImage: editAvatar,
      });

      setProfile(res.user);
      onUserUpdate(res.user);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">
      {/* Profile Header Card */}
      <div className="p-6 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-900/50 border border-neutral-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={profile.profileImage}
            alt={profile.username}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              {profile.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-mono">@{profile.username}</p>
            {profile.bio && <p className="text-xs text-neutral-300 max-w-md pt-1">{profile.bio}</p>}
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Global Rank</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            #{profile.rank || 1}
          </div>
          <p className="text-[11px] text-neutral-500">Live leaderboard index</p>
        </div>

        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Level &amp; XP</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
            Lv.{profile.level}
            <span className="text-xs font-normal text-neutral-400 ml-1">({profile.xp} XP)</span>
          </div>
          <p className="text-[11px] text-neutral-500">Milestone rating</p>
        </div>

        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400 tabular-nums">
            {profile.streak} days
          </div>
          <p className="text-[11px] text-neutral-500">Active consistency</p>
        </div>

        <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {profile.problemsSolved}
          </div>
          <p className="text-[11px] text-neutral-500">{profile.totalSubmissions} submissions</p>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-white">Developer Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            <Mail className="w-4 h-4 text-neutral-500 shrink-0" />
            <div>
              <div className="text-neutral-500 text-[10px]">Email Address</div>
              <div className="text-neutral-200">{profile.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            <Github className="w-4 h-4 text-neutral-500 shrink-0" />
            <div>
              <div className="text-neutral-500 text-[10px]">GitHub Profile</div>
              <div className="text-neutral-200">{profile.githubUrl || 'Not linked'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
            <div>
              <div className="text-neutral-500 text-[10px]">Joined CodeArena</div>
              <div className="text-neutral-200">
                {new Date(profile.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
            <Calendar className="w-4 h-4 text-neutral-500 shrink-0" />
            <div>
              <div className="text-neutral-500 text-[10px]">Last Active</div>
              <div className="text-neutral-200">
                {new Date(profile.lastActiveDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Unlocked Achievements</h3>
          <span className="text-xs font-mono text-neutral-500">
            {achievements.length} unlocked
          </span>
        </div>

        {achievements.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900/20 border border-neutral-800 rounded-xl text-neutral-500 text-xs">
            Solve problems and participate in battles to unlock milestone badges!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 bg-neutral-900/40 border border-neutral-800 rounded-xl flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">
                    {ach.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono mt-1">
                    <span className="text-amber-400 font-semibold">+{ach.xpReward} XP</span>
                    <span>·</span>
                    <span>{new Date(ach.unlockedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-semibold text-white text-sm">Edit Profile Information</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell other developers about your coding focus..."
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={editGithub}
                  onChange={(e) => setEditGithub(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
