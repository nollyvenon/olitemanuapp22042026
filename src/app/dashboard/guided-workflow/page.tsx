'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, Settings, Layout, Bell } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Personalize Dashboard Layout',
    description: 'Choose widgets and layout for your home view',
    guidance: 'Widgets show key information at a glance. Arrange them based on importance to your role. You can rearrange anytime.',
  },
  {
    id: 2,
    title: 'Set Quick Access Shortcuts',
    description: 'Pin frequently used pages and workflows',
    guidance: 'Quick access links appear on your dashboard. Common shortcuts: Create Sales Order, Process Inventory Transfer, Generate Reports.',
  },
  {
    id: 3,
    title: 'Configure Notifications',
    description: 'Choose what alerts you want to receive',
    guidance: 'Receive notifications for: Approvals pending, Order status changes, Stock warnings. Control frequency to avoid alert fatigue.',
  },
  {
    id: 4,
    title: 'Set Performance Goals',
    description: 'Define KPI targets and metrics to track',
    guidance: 'Set realistic, achievable goals. Dashboard will show progress and alert when targets are at risk. Used for performance review.',
  },
  {
    id: 5,
    title: 'Complete Personalization',
    description: 'Review settings and save preferences',
    guidance: 'All settings saved automatically. You can modify anytime. Preferences sync across devices and sessions.',
  },
];

export default function DashboardWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['summary', 'pending', 'tasks']);

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);

  const toggleWidget = (widget: string) => {
    setSelectedWidgets(prev =>
      prev.includes(widget) ? prev.filter(w => w !== widget) : [...prev, widget]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Workflow: Personalize Dashboard"
        description="Step-by-step guide to customize your dashboard experience"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Setup Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-orange-50 border-l-4 border-orange-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-orange-600' : 'text-gray-400'
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

            {/* Widget Summary */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Selected Widgets</p>
              <p className="text-xs text-gray-600">
                {selectedWidgets.length} widget{selectedWidgets.length !== 1 ? 's' : ''} selected
              </p>
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                {selectedWidgets.map(w => (
                  <div key={w} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </div>
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
                <span className="text-sm font-medium text-orange-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-orange-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select widgets for your dashboard:</p>
                    <div className="space-y-2">
                      {[
                        { id: 'summary', label: 'Account Summary', desc: 'Overview of key metrics' },
                        { id: 'pending', label: 'Pending Approvals', desc: 'Items awaiting your action' },
                        { id: 'tasks', label: 'My Tasks', desc: 'Assigned workflow items' },
                        { id: 'recent', label: 'Recent Activity', desc: 'Latest transactions' },
                        { id: 'alerts', label: 'Alerts & Warnings', desc: 'System warnings and issues' },
                        { id: 'shortcuts', label: 'Quick Links', desc: 'Fast access to workflows' },
                      ].map(widget => (
                        <label key={widget.id} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedWidgets.includes(widget.id)}
                            onChange={() => toggleWidget(widget.id)}
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{widget.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{widget.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select your most-used workflows:</p>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Create Sales Order</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" defaultChecked />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Process Inventory Transfer</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Create Journal Entry</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">Generate Reports</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">View KYC Submissions</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select notification preferences:</p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded p-4">
                        <p className="font-medium text-sm mb-3">Email Notifications</p>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Approval requests</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Order status changes</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">Stock warnings</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">Daily summary digest</span>
                          </label>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-4">
                        <p className="font-medium text-sm mb-3">In-App Notifications</p>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Show banner alerts</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Show notification bell count</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">Desktop push notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Set your monthly KPI targets:</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Revenue Target</label>
                      <input type="number" placeholder="₦" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Orders to Process</label>
                      <input type="number" placeholder="Number of orders" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Acquisitions</label>
                      <input type="number" placeholder="New customers" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Key Performance Indicator</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Inventory Turnover Ratio</option>
                        <option>Customer Satisfaction Score</option>
                        <option>Order Fulfillment Rate</option>
                        <option>Approval Timeliness</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Layout className="h-5 w-5 text-orange-600" />
                        <p className="font-semibold text-orange-900">Dashboard Personalization Complete</p>
                      </div>
                      <p className="text-sm text-orange-700 mb-4">
                        Your dashboard is now customized with:
                      </p>
                      <ul className="text-sm text-orange-700 space-y-2 ml-4">
                        <li>✓ {selectedWidgets.length} active widgets</li>
                        <li>✓ Quick access shortcuts for key workflows</li>
                        <li>✓ Custom notification preferences</li>
                        <li>✓ Performance goals and targets</li>
                        <li>✓ Personalized layout and arrangement</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-900">
                        <strong>Remember:</strong> You can change these settings anytime from Settings → Dashboard Preferences
                      </p>
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
                      <Settings className="h-4 w-4" />
                      Save & Apply
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
