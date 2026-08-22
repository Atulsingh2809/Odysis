import { useState } from 'react';
import { UserPlus, Trash2, Mail } from 'lucide-react';
import { tripsApi } from '@/api/trips';
import type { Collaborator } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { getErrorMessage } from '@/api/client';

interface CollaboratorsTabProps {
  tripId: string;
  collaborators: Collaborator[];
  isOwner: boolean;
  onRefresh: () => void;
}

export function CollaboratorsTab({ tripId, collaborators, isOwner, onRefresh }: CollaboratorsTabProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Email address is required');
    try {
      setError(null);
      setInviting(true);
      await tripsApi.invite(tripId, { email, role });
      setInviteModalOpen(false);
      setEmail('');
      onRefresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to invite collaborator. User may not exist.'));
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'EDITOR' | 'VIEWER') => {
    try {
      await tripsApi.updateCollaborator(tripId, userId, newRole);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update collaborator role'));
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;
    try {
      await tripsApi.removeCollaborator(tripId, userId);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to remove collaborator'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Trip Collaborators</h2>
          <p className="text-xs text-slate-500">Invite travel partners to view or edit this itinerary together</p>
        </div>

        {isOwner && (
          <Button onClick={() => setInviteModalOpen(true)} size="sm">
            <UserPlus className="w-4 h-4 mr-1.5" /> Invite Collaborator
          </Button>
        )}
      </div>

      <Card className="p-6 bg-white border border-slate-200 space-y-4">
        <div className="divide-y divide-slate-100">
          {collaborators.map((collab) => (
            <div key={collab.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm border border-primary-200">
                  {collab.user.name?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{collab.user.name}</p>
                  <p className="text-xs text-slate-500">{collab.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isOwner && collab.role !== 'OWNER' ? (
                  <select
                    value={collab.role}
                    onChange={(e) => handleUpdateRole(collab.userId, e.target.value as 'EDITOR' | 'VIEWER')}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                  >
                    <option value="EDITOR">EDITOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      collab.role === 'OWNER'
                        ? 'bg-amber-100 text-amber-800'
                        : collab.role === 'EDITOR'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {collab.role}
                  </span>
                )}

                {isOwner && collab.role !== 'OWNER' && (
                  <button onClick={() => handleRemoveCollaborator(collab.userId)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Modal isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite Collaborator">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <Input
            label="User Email Address"
            type="email"
            placeholder="friend@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Select label="Role Permission" value={role} onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')}>
            <option value="EDITOR">EDITOR (Can add/edit stops & activities)</option>
            <option value="VIEWER">VIEWER (Read-only access)</option>
          </Select>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={inviting}>Send Invite</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
