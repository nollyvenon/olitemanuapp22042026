'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, Bell, Inbox, Filter } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Understand Notification Types',
    description: 'Learn what notifications you can receive',
    guidance: 'Notifications are triggered by system events: Someone submitted an approval, A deadline is approaching, Data validation failed, etc.',
  },
  {
    id: 2,
    title: 'Choose Event Categories',
    description: 'Select which events trigger notifications',
    guidance: 'Categories: Sales (orders, approvals), Inventory (transfers, stock warnings), Finance (reconciliation, approvals), System (backups, maintenance).',
  },
  {
    id: 3,
    title: 'Set Delivery Methods',
    description: 'Choose how to receive notifications',
    guidance: 'Methods: In-app bell icon, Email, SMS (premium), Browser notifications. Mix and match based on urgency.',
  },
  {
    id: 4,
    title: 'Configure Frequency & Timing',
    description: 'Control when and how often you receive alerts',
    guidance: 'Real-time for urgent items, Daily digest for updates, Weekly summary for trends. Avoid alert fatigue.',
  },
  {
    id: 5,
    title: 'Test & Review Settings',
    description: 'Verify notification settings are correct',
    guidance: 'Send test notification to confirm setup. Review notification history. Settings take effect immediately.',
  },
];

export default function NotificationsWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['sales', 'inventory']);

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Workflow: Configure Notifications"
        description="Step-by-step guide to setting up notification preferences"
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
                      ? 'bg-violet-50 border-l-4 border-violet-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-violet-600' : 'text-gray-400'
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

            {/* Categories Summary */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Enabled Categories</p>
              <div className="space-y-1">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map(cat => (
                    <div key={cat} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 bg-violet-600 rounded-full"></span>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">No categories selected</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStepData && (
            <Card className="p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-violet-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-violet-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Common notification events:</p>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-4 bg-blue-50">
                        <p className="font-medium text-sm text-blue-900 mb-2">Sales Approvals</p>
                        <p className="text-xs text-blue-700">Triggered when: Sales order waiting for your approval, Customer limit exceeded, Discount requested</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-green-50">
                        <p className="font-medium text-sm text-green-900 mb-2">Inventory Warnings</p>
                        <p className="text-xs text-green-700">Triggered when: Stock below reorder point, Transfer request awaiting approval, Inventory discrepancy detected</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-amber-50">
                        <p className="font-medium text-sm text-amber-900 mb-2">Financial Alerts</p>
                        <p className="text-xs text-amber-700">Triggered when: Journal entry awaiting approval, Reconciliation needed, Budget threshold exceeded</p>
                      </div>
                      <div className="border rounded-lg p-4 bg-red-50">
                        <p className="font-medium text-sm text-red-900 mb-2">System Notifications</p>
                        <p className="text-xs text-red-700">Triggered when: Maintenance window scheduled, Data backup completed, Security alert detected</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Enable notification categories (select multiple):</p>
                    <div className="space-y-2">
                      {[
                        { id: 'sales', label: 'Sales Orders & Approvals', desc: 'Pending approvals, order status changes' },
                        { id: 'inventory', label: 'Inventory Management', desc: 'Transfer approvals, stock warnings' },
                        { id: 'finance', label: 'Financial Operations', desc: 'Journal approvals, reconciliation alerts' },
                        { id: 'kyc', label: 'KYC Submissions', desc: 'New KYC applications, verification status' },
                        { id: 'system', label: 'System & Maintenance', desc: 'Backups, updates, system alerts' },
                        { id: 'reports', label: 'Reports & Analytics', desc: 'Report generation complete, data updates' },
                      ].map(cat => (
                        <label key={cat.id} className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{cat.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Choose notification delivery channels:</p>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Bell className="h-5 w-5 text-violet-600" />
                          <p className="font-medium text-sm">In-App Notifications</p>
                        </div>
                        <div className="space-y-2 ml-8">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Show bell icon with count</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Show banner for urgent alerts</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">Play sound notification</span>
                          </label>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Inbox className="h-5 w-5 text-violet-600" />
                          <p className="font-medium text-sm">Email Notifications</p>
                        </div>
                        <div className="space-y-2 ml-8">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span className="text-sm">Send for urgent/approval items</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">Send daily digest</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span className="text-sm">Send weekly summary</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level for Real-Time Alerts</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
                        <option>All notifications (most alerts)</option>
                        <option selected>Urgent only (approvals, errors)</option>
                        <option>Critical only (security, failures)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quiet Hours</label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">From</label>
                          <input type="time" defaultValue="18:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">To</label>
                          <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">Notifications during quiet hours won't sound or show banners (saved to inbox)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Digest Frequency</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>Real-time for urgent, Daily digest for others</option>
                        <option>Only daily digest (morning 9 AM)</option>
                        <option>Only weekly digest (every Monday)</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-violet-600" />
                        <p className="font-semibold text-violet-900">Notification Settings Complete</p>
                      </div>
                      <p className="text-sm text-violet-700 mb-4">
                        Your notification preferences are configured with:
                      </p>
                      <ul className="text-sm text-violet-700 space-y-2 ml-4">
                        <li>✓ {selectedCategories.length} event categories enabled</li>
                        <li>✓ Delivery via in-app notifications and email</li>
                        <li>✓ Quiet hours from 6 PM to 8 AM</li>
                        <li>✓ Real-time alerts for urgent items</li>
                        <li>✓ Daily digest for routine updates</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 mb-3 font-medium">Send Test Notification</p>
                      <Button style={{ background: '#FF9900', color: '#0f1111' }} className="w-full">
                        Send Test Email & In-App Alert
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-gray-600">
                        ✓ Settings are live. You can modify anytime from Settings → Notifications
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
                    'Setup Complete'
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
