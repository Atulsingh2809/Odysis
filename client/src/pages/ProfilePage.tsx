import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Bookmark, Trash2, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/api/users';
import type { SavedDestination, Currency } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { getErrorMessage } from '@/api/client';

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState<Currency>(user?.profile?.currency || 'INR');
  const [language, setLanguage] = useState(user?.profile?.language || 'en');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || '');

  const [savedDestinations, setSavedDestinations] = useState<SavedDestination[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    usersApi
      .saved()
      .then(setSavedDestinations)
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await usersApi.update({
        name,
        currency,
        language,
        avatarUrl: avatarUrl || null,
      });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async (cityId: string) => {
    try {
      await usersApi.unsaveCity(cityId);
      setSavedDestinations((prev) => prev.filter((d) => d.cityId !== cityId));
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to unsave city'));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await usersApi.deleteAccount();
      await logout();
      navigate('/login');
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete account'));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile & Preferences</h1>
        <p className="text-slate-500 text-sm">Manage your account details, default currency, and saved destinations</p>
      </div>

      <Card className="p-6 bg-white border border-slate-200 space-y-6">
        <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" /> Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Preferred Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AED">AED (AED)</option>
            </Select>

            <Select
              label="Preferred Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </Select>
          </div>

          <Input
            label="Avatar Photo URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-500" /> Bookmarked Destinations
        </h2>

        {loadingSaved ? (
          <p className="text-xs text-slate-400">Loading saved cities...</p>
        ) : savedDestinations.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No bookmarked cities yet. Explore cities to save your favorite destinations!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedDestinations.map((sd) => (
              <div key={sd.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <img src={sd.city.imageUrl} alt={sd.city.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{sd.city.name}</p>
                    <p className="text-xs text-slate-500">{sd.city.country}</p>
                  </div>
                </div>

                <button onClick={() => handleUnsave(sd.cityId)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-red-50/50 border border-red-200 space-y-4">
        <div className="flex items-center gap-2 text-red-800">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-slate-600">
          Permanently delete your GlobeTrotter account and all associated travel itineraries, expense records, and saved data.
        </p>
        <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
          Delete Account
        </Button>
      </Card>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Your Account?"
        message="Are you completely sure? This will delete all your trips, itineraries, custom expenses, and profile data permanently. This action cannot be reversed."
        confirmText="Yes, Delete My Account"
        loading={deletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
