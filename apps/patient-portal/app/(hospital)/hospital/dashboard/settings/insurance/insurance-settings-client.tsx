/* eslint-disable */
'use client';

import {
  Plus,
  ShieldAlert,
  Building,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Percent,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  createHospitalInsurance,
  updateHospitalInsurance,
  deleteHospitalInsurance,
  toggleHospitalInsurance,
} from '@/lib/hospital-actions';

interface InsurancePolicy {
  id: string;
  insurerName: string;
  insurerType: 'GENERAL_INSURANCE' | 'TPA' | 'GOVERNMENT';
  policyNumber: string | null;
  tieUpLetterFileUrl: string | null;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  specialitiesCovered: string[];
  coPayPercentage: number | null;
  cashlessNetwork: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InsuranceSettingsClientProps {
  initialInsurances: InsurancePolicy[];
  hospitalId: string;
}

export default function InsuranceSettingsClient({
  initialInsurances,
  hospitalId,
}: InsuranceSettingsClientProps) {
  const [insurances, setInsurances] = useState<InsurancePolicy[]>(initialInsurances);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null);

  // Form states
  const [insurerName, setInsurerName] = useState('');
  const [insurerType, setInsurerType] = useState<'GENERAL_INSURANCE' | 'TPA' | 'GOVERNMENT'>(
    'GENERAL_INSURANCE',
  );
  const [policyNumber, setPolicyNumber] = useState('');
  const [tieUpLetterFileUrl, setTieUpLetterFileUrl] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [coPayPercentage, setCoPayPercentage] = useState('');
  const [cashlessNetwork, setCashlessNetwork] = useState(true);
  const [specialitiesCoveredStr, setSpecialitiesCoveredStr] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openAddDialog = () => {
    setEditingPolicy(null);
    setInsurerName('');
    setInsurerType('GENERAL_INSURANCE');
    setPolicyNumber('');
    setTieUpLetterFileUrl('');
    setValidFrom('');
    setValidTo('');
    setCoPayPercentage('');
    setCashlessNetwork(true);
    setSpecialitiesCoveredStr('');
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (policy: InsurancePolicy) => {
    setEditingPolicy(policy);
    setInsurerName(policy.insurerName);
    setInsurerType(policy.insurerType);
    setPolicyNumber(policy.policyNumber || '');
    setTieUpLetterFileUrl(policy.tieUpLetterFileUrl || '');
    setValidFrom(policy.validFrom);
    setValidTo(policy.validTo);
    setCoPayPercentage(policy.coPayPercentage !== null ? String(policy.coPayPercentage) : '');
    setCashlessNetwork(policy.cashlessNetwork);
    setSpecialitiesCoveredStr(policy.specialitiesCovered.join(', '));
    setErrorMsg('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const specialities = specialitiesCoveredStr
      ? specialitiesCoveredStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload = {
      insurerName,
      insurerType,
      policyNumber: policyNumber || null,
      tieUpLetterFileUrl: tieUpLetterFileUrl || null,
      validFrom,
      validTo,
      coPayPercentage: coPayPercentage ? Number(coPayPercentage) : null,
      cashlessNetwork,
      specialitiesCovered: specialities,
    };

    try {
      if (editingPolicy) {
        const res = await updateHospitalInsurance({ id: editingPolicy.id, ...payload });
        if (res.success && res.data) {
          const updatedData = res.data as any;
          setInsurances(
            insurances.map((ins) =>
              ins.id === editingPolicy.id
                ? {
                    ...updatedData,
                    coPayPercentage: updatedData.coPayPercentage
                      ? Number(updatedData.coPayPercentage)
                      : null,
                    validFrom: updatedData.validFrom.toISOString
                      ? updatedData.validFrom.toISOString().split('T')[0]
                      : String(updatedData.validFrom).split('T')[0],
                    validTo: updatedData.validTo.toISOString
                      ? updatedData.validTo.toISOString().split('T')[0]
                      : String(updatedData.validTo).split('T')[0],
                  }
                : ins,
            ),
          );
          setIsDialogOpen(false);
        } else {
          setErrorMsg(res.message || 'Failed to update policy');
        }
      } else {
        const res = await createHospitalInsurance(payload);
        if (res.success && res.data) {
          const newData = res.data as any;
          const formattedNew: InsurancePolicy = {
            ...newData,
            coPayPercentage: newData.coPayPercentage ? Number(newData.coPayPercentage) : null,
            validFrom: newData.validFrom.toISOString
              ? newData.validFrom.toISOString().split('T')[0]
              : String(newData.validFrom).split('T')[0],
            validTo: newData.validTo.toISOString
              ? newData.validTo.toISOString().split('T')[0]
              : String(newData.validTo).split('T')[0],
          };
          setInsurances([formattedNew, ...insurances]);
          setIsDialogOpen(false);
        } else {
          setErrorMsg(res.message || 'Failed to add policy');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accepted insurer?')) return;
    try {
      const res = await deleteHospitalInsurance(id, hospitalId);
      if (res.success) {
        setInsurances(insurances.filter((ins) => ins.id !== id));
      } else {
        alert(res.message || 'Failed to delete insurer');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete insurer');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await toggleHospitalInsurance(id);
      if (res.success && res.data) {
        const updatedData = res.data as any;
        setInsurances(
          insurances.map((ins) =>
            ins.id === id
              ? {
                  ...ins,
                  cashlessNetwork: updatedData.cashlessNetwork,
                }
              : ins,
          ),
        );
      } else {
        alert(res.message || 'Failed to update cashless status');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update cashless status');
    }
  };

  return (
    <Card className="bg-slate-900 border-slate-800 text-slate-100">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-100">
            Insurance Panel list
          </CardTitle>
          <CardDescription className="text-slate-400">
            Show insurance companies accepted during booking flow.
          </CardDescription>
        </div>
        <Button onClick={openAddDialog} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Panel
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        {insurances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No insurance panels accepted yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Add your first accepted insurer. These will appear to patients during scheduling.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850">
                <tr>
                  <th className="py-3 px-4">Insurer Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Co-Pay / Cashless</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {insurances.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-100">
                      <div className="flex flex-col">
                        <span>{ins.insurerName}</span>
                        {ins.policyNumber && (
                          <span className="text-[11px] font-normal text-slate-500 mt-0.5">
                            Agreement #: {ins.policyNumber}
                          </span>
                        )}
                        {ins.specialitiesCovered.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {ins.specialitiesCovered.map((s, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-slate-800 text-[10px] text-slate-400"
                              >
                                {s}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        className={
                          ins.insurerType === 'GENERAL_INSURANCE'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : ins.insurerType === 'TPA'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                        }
                      >
                        {ins.insurerType === 'GENERAL_INSURANCE'
                          ? 'General'
                          : ins.insurerType === 'TPA'
                            ? 'TPA'
                            : 'Govt'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={ins.cashlessNetwork}
                            onCheckedChange={() => handleToggle(ins.id)}
                            className="data-[state=checked]:bg-teal-500"
                          />
                          <span className="text-[12px] font-medium text-slate-400">
                            {ins.cashlessNetwork ? 'Cashless' : 'Co-Payment Only'}
                          </span>
                        </div>
                        {ins.coPayPercentage !== null && (
                          <Badge
                            variant="outline"
                            className="text-slate-400 border-slate-700 text-[11px]"
                          >
                            {ins.coPayPercentage}% Co-Pay
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>From: {ins.validFrom}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px]">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>To: {ins.validTo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {ins.tieUpLetterFileUrl && (
                          <a
                            href={ins.tieUpLetterFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditDialog(ins)}
                          className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ins.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {editingPolicy ? 'Edit Insurance Panel' : 'Add Accepted Insurer'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Fill in panel details. These will reflect for patients checking out.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-3 rounded-lg flex items-start gap-2.5 text-sm">
                <ShieldAlert className="h-4 w-4 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="insurerName">Insurer Name *</Label>
              <Input
                id="insurerName"
                value={insurerName}
                onChange={(e) => setInsurerName(e.target.value)}
                placeholder="e.g. HDFC Ergo Health"
                required
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="insurerType">Provider Type *</Label>
                <Select value={insurerType} onValueChange={(val: any) => setInsurerType(val)}>
                  <SelectTrigger
                    id="insurerType"
                    className="bg-slate-950 border-slate-800 text-slate-100"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <SelectItem value="GENERAL_INSURANCE">General Insurance</SelectItem>
                    <SelectItem value="TPA">TPA / Administrator</SelectItem>
                    <SelectItem value="GOVERNMENT">Government Scheme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="policyNumber">Agreement / Policy #</Label>
                <Input
                  id="policyNumber"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="e.g. MOA-2024-912"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="validTo">Valid To *</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialities">Covered Specialities (comma separated)</Label>
              <Input
                id="specialities"
                value={specialitiesCoveredStr}
                onChange={(e) => setSpecialitiesCoveredStr(e.target.value)}
                placeholder="e.g. Cardiology, Pediatrics, OPD (leave blank for all)"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="cashless"
                  checked={cashlessNetwork}
                  onCheckedChange={setCashlessNetwork}
                  className="data-[state=checked]:bg-teal-500"
                />
                <Label htmlFor="cashless" className="cursor-pointer">
                  Cashless Network
                </Label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coPay">Co-Pay Percentage (%)</Label>
                <div className="relative">
                  <Input
                    id="coPay"
                    type="number"
                    min="0"
                    max="100"
                    value={coPayPercentage}
                    onChange={(e) => setCoPayPercentage(e.target.value)}
                    placeholder="0"
                    className="bg-slate-950 border-slate-800 text-slate-100 pr-8"
                  />
                  <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tieUpLetter">Tie-up / MOA Document URL</Label>
              <Input
                id="tieUpLetter"
                value={tieUpLetterFileUrl}
                onChange={(e) => setTieUpLetterFileUrl(e.target.value)}
                placeholder="e.g. https://supabase.storage/moa.pdf"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading ? 'Processing...' : editingPolicy ? 'Save Changes' : 'Add Panel'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
