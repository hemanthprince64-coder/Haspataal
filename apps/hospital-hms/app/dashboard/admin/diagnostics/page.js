'use client';

import { useState, useEffect } from 'react';
import { getHospitalCatalog, updateDiagnosticPrice } from '@/app/actions/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@haspataal/ui';
import { Input } from '@haspataal/ui';
import { Button } from '@haspataal/ui';
import { Checkbox } from '@haspataal/ui';
import { Skeleton } from '@haspataal/ui';
import { LabTest, Save } from 'lucide-react';

export default function DiagnosticPricingPage() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    const res = await getHospitalCatalog();
    if (res.success) {
      setCatalog(res.data);
    } else {
      alert(res.message);
    }
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await updateDiagnosticPrice(null, formData);
    if (res.success) {
      alert('Price Updated');
      fetchCatalog();
    } else {
      alert('Failed');
    }
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <LabTest className="h-6 w-6 text-primary" />
          Diagnostic Pricing Manager
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your diagnostic test prices and availability
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Test Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Global TAT (Hrs)</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Your Price (₹)</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Available</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {catalog.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{test.testName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{test.category?.name}</td>
                    <td className="px-4 py-3">{test.turnaroundTimeHours}</td>
                    <td className="px-4 py-3" colSpan="3">
                      <form onSubmit={handleUpdate} className="flex items-center gap-3">
                        <input type="hidden" name="testId" value={test.id} />
                        <Input
                          type="number"
                          name="price"
                          defaultValue={test.price || 0}
                          className="w-24"
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`avail-${test.id}`}
                            name="isAvailable"
                            defaultChecked={test.isAvailable}
                          />
                          <label htmlFor={`avail-${test.id}`} className="text-sm">Active</label>
                        </div>
                        <Button type="submit" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
