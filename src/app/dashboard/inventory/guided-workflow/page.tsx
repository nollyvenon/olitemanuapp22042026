'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, AlertCircle } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Transfer Type',
    description: 'Choose between transfer, adjustment, or return',
    guidance: 'Transfer: Move stock between locations. Adjustment: Correct inventory count. Return: Process customer returns.',
  },
  {
    id: 2,
    title: 'Select Source Location',
    description: 'Choose where stock is coming from',
    guidance: 'You can only transfer from locations you have access to. Check available quantities.',
  },
  {
    id: 3,
    title: 'Add Items',
    description: 'Select products and quantities to transfer',
    guidance: 'System prevents overselling. Red text indicates insufficient stock at source location.',
  },
  {
    id: 4,
    title: 'Select Destination',
    description: 'Choose where stock is going',
    guidance: 'Ensure destination location is correct. Multi-location transfers require both managers approval.',
  },
  {
    id: 5,
    title: 'Review & Submit',
    description: 'Verify all details and submit for approval',
    guidance: 'Check quantities and locations one final time. Submission triggers manager notification.',
  },
];

export default function InventoryWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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
        title="Guided Workflow: Inventory Transfer"
        description="Step-by-step guide to transferring stock between locations"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Transfer Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-green-50 border-l-4 border-green-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-green-600' : 'text-gray-400'
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
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStepData && (
            <Card className="p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-green-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-green-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select transfer type:</p>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" defaultChecked className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Inter-Location Transfer</p>
                          <p className="text-xs text-gray-500">Move stock between warehouses</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Inventory Adjustment</p>
                          <p className="text-xs text-gray-500">Correct physical count discrepancies</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="type" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Customer Return</p>
                          <p className="text-xs text-gray-500">Process returned goods</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Source Location *
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option>Select location...</option>
                      <option>Lagos Warehouse - 450 units available</option>
                      <option>Abuja Branch - 120 units available</option>
                      <option>Port Harcourt - 80 units available</option>
                    </select>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Add products to transfer:</p>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center py-8">
                        <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No products added yet</p>
                        <Button className="mt-4" style={{ background: '#FF9900', color: '#0f1111' }}>
                          + Add Item
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Destination Location *
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option>Select location...</option>
                      <option>Abuja Branch</option>
                      <option>Port Harcourt</option>
                      <option>Enugu Warehouse</option>
                    </select>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-3">Transfer Summary:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• From: Lagos Warehouse → To: Abuja Branch</li>
                        <li>• 0 items selected (add items to proceed)</li>
                        <li>• Status: Ready for approval</li>
                      </ul>
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
                    'Submit Transfer'
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
