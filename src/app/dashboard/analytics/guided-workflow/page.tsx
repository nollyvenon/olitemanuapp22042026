'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, LineChart, Download } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Choose Analysis Type',
    description: 'Select what you want to analyze',
    guidance: 'Revenue Analysis: Track income trends. Sales Performance: Measure productivity. Inventory Health: Monitor stock efficiency. Customer Metrics: Understand buyer behavior.',
  },
  {
    id: 2,
    title: 'Configure Dashboard',
    description: 'Select KPIs and visualization types',
    guidance: 'Choose metrics relevant to your analysis. Mix of charts (line, bar, pie) recommended for comprehensive view. At least 3 metrics recommended.',
  },
  {
    id: 3,
    title: 'Set Comparison Periods',
    description: 'Define time ranges for comparison',
    guidance: 'Current Period: Latest data. Comparison Period: Reference point (previous month/year). Helps identify trends and growth patterns.',
  },
  {
    id: 4,
    title: 'Apply Segmentation',
    description: 'Break down data by dimensions',
    guidance: 'Segment by: Team, Location, Product Category, Customer Type. Deeper insights by identifying which segments drive results.',
  },
  {
    id: 5,
    title: 'Save & Share Analytics',
    description: 'Create dashboard and share with team',
    guidance: 'Dashboards update in real-time. Set permissions to control visibility. Export snapshots for reports and presentations.',
  },
];

export default function AnalyticsWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue']);

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Workflow: Build Custom Analytics"
        description="Step-by-step guide to creating personalized analytics dashboards"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Dashboard Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-rose-50 border-l-4 border-rose-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-rose-600' : 'text-gray-400'
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

            {/* Metrics Summary */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Selected Metrics</p>
              <div className="flex flex-wrap gap-1">
                {selectedMetrics.map(metric => (
                  <span key={metric} className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-medium">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStepData && (
            <Card className="p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-rose-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-rose-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select analysis type:</p>
                    <div className="space-y-2">
                      <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" defaultChecked className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Revenue Analysis</p>
                          <p className="text-xs text-gray-500">Track income, sales trends, and profitability</p>
                        </div>
                      </label>
                      <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Sales Performance</p>
                          <p className="text-xs text-gray-500">Measure team productivity and conversion rates</p>
                        </div>
                      </label>
                      <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Inventory Health</p>
                          <p className="text-xs text-gray-500">Monitor stock levels, turnover, and efficiency</p>
                        </div>
                      </label>
                      <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" className="mr-3 mt-1" />
                        <div>
                          <p className="font-medium text-sm">Customer Metrics</p>
                          <p className="text-xs text-gray-500">Understand buyer behavior and loyalty</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select KPIs to display (choose multiple):</p>
                    <div className="space-y-2">
                      {[
                        { id: 'revenue', label: 'Total Revenue', desc: 'Sum of all sales' },
                        { id: 'orders', label: 'Order Count', desc: 'Number of orders processed' },
                        { id: 'avg', label: 'Average Order Value', desc: 'Mean transaction amount' },
                        { id: 'growth', label: 'Growth %', desc: 'Period-over-period growth rate' },
                        { id: 'margin', label: 'Profit Margin', desc: 'Revenue minus costs' },
                        { id: 'conversion', label: 'Conversion Rate', desc: '% of leads becoming customers' },
                      ].map(metric => (
                        <label key={metric.id} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedMetrics.includes(metric.id)}
                            onChange={() => toggleMetric(metric.id)}
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{metric.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{metric.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Period *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
                        <option>This Month</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comparison Period *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
                        <option selected>Previous Month</option>
                        <option>Previous Quarter</option>
                        <option>Previous Year</option>
                        <option>Same Period Last Year</option>
                      </select>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-900">
                        <strong>Comparison helps:</strong> Identify if you're growing, stagnating, or declining. Essential for business decisions.
                      </p>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Break down by dimensions (optional):</p>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <div>
                          <p className="font-medium text-sm">By Team / Department</p>
                          <p className="text-xs text-gray-500">See which teams are top performers</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <div>
                          <p className="font-medium text-sm">By Location / Branch</p>
                          <p className="text-xs text-gray-500">Compare performance across regions</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">By Product Category</p>
                          <p className="text-xs text-gray-500">Identify high-performing product lines</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">By Customer Type</p>
                          <p className="text-xs text-gray-500">Corporate vs retail vs government</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <LineChart className="h-5 w-5 text-rose-600" />
                        <p className="font-semibold text-rose-900">Dashboard Ready</p>
                      </div>
                      <p className="text-sm text-rose-700 mb-4">
                        Your custom analytics dashboard will include real-time data with:
                      </p>
                      <ul className="text-sm text-rose-700 space-y-2 ml-4">
                        <li>✓ Interactive charts and visualizations</li>
                        <li>✓ Auto-updating data (refreshes every 5 min)</li>
                        <li>✓ Exportable reports and snapshots</li>
                        <li>✓ Shareable links with permission control</li>
                        <li>✓ Historical data comparison</li>
                        <li>✓ Drill-down capabilities</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <span className="text-sm">Save to My Dashboards</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-sm">Share with team (enable access)</span>
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
                    <span className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Create Dashboard
                    </span>
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
