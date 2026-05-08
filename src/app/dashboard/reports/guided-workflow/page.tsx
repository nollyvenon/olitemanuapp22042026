'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, BarChart3 } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Report Type',
    description: 'Choose the report you need',
    guidance: 'Different reports show different data: Sales shows orders and revenue, Inventory shows stock levels and movements, Financial shows ledgers and reconciliation.',
  },
  {
    id: 2,
    title: 'Configure Parameters',
    description: 'Set date range and report scope',
    guidance: 'Select date range for data inclusion. Monthly reports are recommended for standard analysis. Custom ranges available for deep dives.',
  },
  {
    id: 3,
    title: 'Set Filters',
    description: 'Filter by customer, product, location, or department',
    guidance: 'Filters narrow results to show only relevant data. Example: Show only sales from Lagos location, or inventory from specific category.',
  },
  {
    id: 4,
    title: 'Review Data',
    description: 'Preview report data before generating',
    guidance: 'Review row count and key metrics to ensure correct data is selected. You can go back to adjust filters if needed.',
  },
  {
    id: 5,
    title: 'Generate & Export',
    description: 'Create report and choose export format',
    guidance: 'Export as PDF for printing and sharing, Excel for further analysis, or view online. Large reports may take 1-2 minutes to process.',
  },
];

export default function ReportsWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedReport, setSelectedReport] = useState('sales');

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Workflow: Generate Report"
        description="Step-by-step guide to creating and exporting reports"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Report Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-cyan-50 border-l-4 border-cyan-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-cyan-600' : 'text-gray-400'
                        }`}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Data Summary */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Report Summary</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report Type:</span>
                  <span className="font-semibold text-gray-900 capitalize">{selectedReport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rows:</span>
                  <span className="font-semibold text-gray-900">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-semibold text-gray-900">This Month</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStepData && (
            <Card className="p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-cyan-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-cyan-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select report type:</p>
                    <div className="space-y-3">
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: selectedReport === 'sales' ? '#0891b2' : '#d1d5db' }}>
                        <input type="radio" name="report" value="sales" checked={selectedReport === 'sales'} onChange={(e) => setSelectedReport(e.target.value)} className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Sales Report</p>
                          <p className="text-xs text-gray-500 mt-1">Orders, revenue, customer performance</p>
                        </div>
                      </label>
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: selectedReport === 'inventory' ? '#0891b2' : '#d1d5db' }}>
                        <input type="radio" name="report" value="inventory" checked={selectedReport === 'inventory'} onChange={(e) => setSelectedReport(e.target.value)} className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Inventory Report</p>
                          <p className="text-xs text-gray-500 mt-1">Stock levels, movements, adjustments</p>
                        </div>
                      </label>
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: selectedReport === 'financial' ? '#0891b2' : '#d1d5db' }}>
                        <input type="radio" name="report" value="financial" checked={selectedReport === 'financial'} onChange={(e) => setSelectedReport(e.target.value)} className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Financial Report</p>
                          <p className="text-xs text-gray-500 mt-1">Ledgers, reconciliation, trial balance</p>
                        </div>
                      </label>
                      <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{ borderColor: selectedReport === 'kyc' ? '#0891b2' : '#d1d5db' }}>
                        <input type="radio" name="report" value="kyc" checked={selectedReport === 'kyc'} onChange={(e) => setSelectedReport(e.target.value)} className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">KYC Report</p>
                          <p className="text-xs text-gray-500 mt-1">Customer verification status, compliance</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Report Scope</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>Last 3 Months</option>
                        <option>Last Year</option>
                        <option>Custom Range</option>
                      </select>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-900">
                        <strong>Tip:</strong> Monthly reports process faster. Use custom dates only when analyzing specific periods.
                      </p>
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Apply filters to narrow results:</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>All Locations</option>
                        <option>Lagos Warehouse</option>
                        <option>Abuja Branch</option>
                        <option>Port Harcourt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department/Module</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>All Departments</option>
                        <option>Sales</option>
                        <option>Inventory</option>
                        <option>Finance</option>
                        <option>Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category/Product Type (Optional)</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>All Categories</option>
                        <option>Electronics</option>
                        <option>Consumables</option>
                        <option>Hardware</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="h-6 w-6 text-cyan-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Report Preview</p>
                          <p className="text-xs text-gray-600">Sales Report for May 2026</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">₦2.4M</p>
                            <p className="text-xs text-gray-600 mt-1">Total Revenue</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">345</p>
                            <p className="text-xs text-gray-600 mt-1">Orders</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">128</p>
                            <p className="text-xs text-gray-600 mt-1">Customers</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      ✓ Data looks correct. Click Next to proceed with export options.
                    </p>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Choose export format:</p>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="format" defaultChecked className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">PDF Document</p>
                          <p className="text-xs text-gray-500">Formatted for printing and sharing</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="format" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Excel Spreadsheet</p>
                          <p className="text-xs text-gray-500">For further analysis and pivot tables</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="format" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">CSV File</p>
                          <p className="text-xs text-gray-500">Raw data for import to other systems</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="format" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">View Online</p>
                          <p className="text-xs text-gray-500">Interactive dashboard in the system</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  {completedSteps.includes(currentStep) ? '✓ Completed' : 'Current Step'}
                </span>
                <Button
                  style={{ background: '#FF9900', color: '#0f1111' }}
                  onClick={() => completeStep(currentStep)}
                >
                  {currentStep === steps.length ? (
                    'Generate Report'
                  ) : (
                    <>
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
