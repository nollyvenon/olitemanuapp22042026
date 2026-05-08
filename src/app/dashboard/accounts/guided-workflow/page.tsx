'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, AlertTriangle } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Voucher Type',
    description: 'Choose payment, receipt, or journal entry',
    guidance: 'Payment: Money out. Receipt: Money in. Journal: Internal transfer between accounts.',
  },
  {
    id: 2,
    title: 'Set Date & Reference',
    description: 'Date of transaction and reference number',
    guidance: 'Date cannot be in future. Reference helps track the transaction source.',
  },
  {
    id: 3,
    title: 'Add Debit Entry',
    description: 'Account to debit and amount',
    guidance: 'Debit accounts include Expense, Asset, and Liability accounts. Select carefully.',
  },
  {
    id: 4,
    title: 'Add Credit Entry',
    description: 'Account to credit and amount',
    guidance: 'Credit accounts include Revenue, Liability, and Capital accounts. Amount MUST equal debit.',
  },
  {
    id: 5,
    title: 'Verify & Submit',
    description: 'Ensure debits = credits and submit',
    guidance: 'Double-entry bookkeeping: Total debits MUST equal total credits. System enforces this rule.',
  },
];

export default function AccountsWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [debitsTotal, setDebitsTotal] = useState(0);
  const [creditsTotal, setCreditsTotal] = useState(0);

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const isBalanced = debitsTotal > 0 && debitsTotal === creditsTotal;
  const currentStepData = steps.find(s => s.id === currentStep);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Workflow: Create Voucher"
        description="Step-by-step guide to creating balanced journal vouchers"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Voucher Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-purple-50 border-l-4 border-purple-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-purple-600' : 'text-gray-400'
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

            {/* Balance Check */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Entry Balance</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Debits:</span>
                  <span className="font-semibold text-gray-900">₦{debitsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Credits:</span>
                  <span className="font-semibold text-gray-900">₦{creditsTotal.toLocaleString()}</span>
                </div>
                <div className={`mt-2 p-2 rounded text-xs font-medium text-center ${
                  isBalanced
                    ? 'bg-green-100 text-green-700'
                    : debitsTotal > 0 || creditsTotal > 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {isBalanced ? '✓ Balanced' : debitsTotal > 0 || creditsTotal > 0 ? '✗ Unbalanced' : 'Add entries'}
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
                <span className="text-sm font-medium text-purple-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-purple-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">Select the type of voucher:</p>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="type" defaultChecked className="mr-3" />
                      <div>
                        <p className="font-medium text-sm">Payment Voucher</p>
                        <p className="text-xs text-gray-500">Money going out (debit expense/asset)</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="type" className="mr-3" />
                      <div>
                        <p className="font-medium text-sm">Receipt Voucher</p>
                        <p className="text-xs text-gray-500">Money coming in (credit income)</p>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="radio" name="type" className="mr-3" />
                      <div>
                        <p className="font-medium text-sm">Journal Entry</p>
                        <p className="text-xs text-gray-500">Internal transfers between accounts</p>
                      </div>
                    </label>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number *</label>
                      <input type="text" placeholder="e.g., INV-001, CHQ-2026-001" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea placeholder="What is this voucher for?" className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" />
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Add debit entries:</p>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center py-8">
                        <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No debits added</p>
                        <Button className="mt-4" style={{ background: '#FF9900', color: '#0f1111' }}>
                          + Add Debit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Add credit entries:</p>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center py-8">
                        <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No credits added</p>
                        <Button className="mt-4" style={{ background: '#FF9900', color: '#0f1111' }}>
                          + Add Credit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className={`border rounded-lg p-6 ${isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className={`font-semibold mb-3 ${isBalanced ? 'text-green-900' : 'text-red-900'}`}>
                        {isBalanced ? '✓ Voucher is Balanced' : '✗ Voucher is NOT Balanced'}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Debits:</p>
                          <p className="text-lg font-bold">₦{debitsTotal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Credits:</p>
                          <p className="text-lg font-bold">₦{creditsTotal.toLocaleString()}</p>
                        </div>
                      </div>
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
                  disabled={currentStep === steps.length && !isBalanced}
                >
                  {currentStep === steps.length ? (
                    isBalanced ? 'Submit Voucher' : 'Balance Required'
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
