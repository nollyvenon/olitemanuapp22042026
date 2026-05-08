'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Customer',
    description: 'Choose an existing customer or create a new one',
    guidance: 'Verify customer is KYC approved before proceeding. Check credit limit and payment terms.',
  },
  {
    id: 2,
    title: 'Add Products',
    description: 'Select products and enter quantities',
    guidance: 'System will auto-check inventory availability. Products showing red text have insufficient stock.',
  },
  {
    id: 3,
    title: 'Review Pricing',
    description: 'Confirm prices, apply discounts if approved',
    guidance: 'Discounts must be pre-approved by manager. Prices pulled from active price list automatically.',
  },
  {
    id: 4,
    title: 'Verify Order',
    description: 'Check all details before submission',
    guidance: 'Ensure quantities are correct, customer details accurate, and total amount matches expectations.',
  },
  {
    id: 5,
    title: 'Submit for Approval',
    description: 'Send order to manager for authorization',
    guidance: 'Order status changes to "Submitted". Manager will review within 24 hours.',
  },
];

export default function GuidedWorkflow() {
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
        title="Guided Workflow: Create Sales Order"
        description="Step-by-step guide to creating and submitting a sales order"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Workflow Steps</h3>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-50 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-blue-600' : 'text-gray-400'
                        }`}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-gray-500">
                Progress: {completedSteps.length} of {steps.length} steps
              </p>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 transition-all"
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStepData && (
            <Card className="p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-600">
                    Step {currentStepData.id} of {steps.length}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              {/* Guidance Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer *
                      </label>
                      <input
                        type="text"
                        placeholder="Search or select customer..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        ✓ Must have approved KYC | ✓ Check credit limit | ✓ Verify location access
                      </p>
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Add products one by one:</p>
                    <div className="border rounded-lg p-4">
                      <div className="text-center text-gray-500 py-8">
                        <p className="text-sm">No products added yet</p>
                        <Button className="mt-4" style={{ background: '#FF9900', color: '#0f1111' }}>
                          + Add Product
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Review pricing details:</p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Product</th>
                          <th className="text-right py-2 px-2">Qty</th>
                          <th className="text-right py-2 px-2">Unit Price</th>
                          <th className="text-right py-2 px-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-gray-500 border-b h-8">
                          <td colSpan={4} className="text-center py-8">
                            Add products to see pricing
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-4">Verification checklist:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> Customer details correct
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> All quantities entered
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> Prices reviewed
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> Discounts approved
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" /> Total amount matches
                      </li>
                    </ul>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <p className="text-sm text-green-900 font-medium">Ready to submit!</p>
                    <p className="text-sm text-green-700 mt-2">
                      Order will be sent to manager for approval. You'll receive a notification once approved.
                    </p>
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
                  disabled={currentStep === steps.length && completedSteps.includes(steps.length)}
                >
                  {currentStep === steps.length ? 'Submit Order' : (
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
