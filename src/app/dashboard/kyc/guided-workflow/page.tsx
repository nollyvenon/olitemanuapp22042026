'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, AlertCircle, Upload } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Enter customer personal details',
    guidance: 'Ensure all information matches government-issued identification. First name and last name are required for identity verification.',
  },
  {
    id: 2,
    title: 'Business Information',
    description: 'Provide business and tax details',
    guidance: 'Business registration number and tax ID are required for corporate verification. Ensure documents are recent (not older than 6 months).',
  },
  {
    id: 3,
    title: 'Upload Documentation',
    description: 'Submit required identification and proof of address',
    guidance: 'Required: Photo ID, Proof of Address, Business Registration. All files must be clear, legible, and in PDF/JPG format.',
  },
  {
    id: 4,
    title: 'Review Verification',
    description: 'Check verification status and any issues',
    guidance: 'System automatically validates documents. Red flags indicate missing or unclear information. Contact support if verification fails.',
  },
  {
    id: 5,
    title: 'Submit for Approval',
    description: 'Submit KYC application for final review',
    guidance: 'After submission, verification team has 48 hours to review. You will receive email notification when status changes.',
  },
];

export default function KYCWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');

  const completeStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };

  const currentStepData = steps.find(s => s.id === currentStep);
  const isVerified = verificationStatus === 'verified';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guided Workflow: KYC Verification"
        description="Step-by-step guide to complete Know Your Customer verification"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Verification Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-indigo-600' : 'text-gray-400'
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

            {/* Status Check */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Verification Status</p>
              <div className={`p-3 rounded text-sm font-medium text-center ${
                isVerified
                  ? 'bg-green-100 text-green-700'
                  : verificationStatus === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isVerified ? '✓ Verified' : verificationStatus === 'rejected' ? '✗ Rejected' : 'Pending Review'}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStepData && (
            <Card className="p-8">
              <div className="mb-6">
                <span className="text-sm font-medium text-indigo-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-indigo-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input type="text" placeholder="As shown on ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input type="text" placeholder="As shown on ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input type="tel" placeholder="+234..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Name *</label>
                      <input type="text" placeholder="Registered business name" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number *</label>
                      <input type="text" placeholder="CAC or equivalent" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID (TIN) *</label>
                      <input type="text" placeholder="Federal Tax ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Address *</label>
                      <textarea placeholder="Full registered address" className="w-full px-3 py-2 border border-gray-300 rounded-lg h-20" />
                    </div>
                  </div>
                )}

                {currentStepData.id === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Upload required documents:</p>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Photo ID / Passport</p>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG (max 5MB)</p>
                        <Button className="mt-3" style={{ background: '#FF9900', color: '#0f1111' }}>
                          Choose File
                        </Button>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Proof of Address</p>
                        <p className="text-xs text-gray-500 mt-1">Utility bill or bank statement (max 5MB)</p>
                        <Button className="mt-3" style={{ background: '#FF9900', color: '#0f1111' }}>
                          Choose File
                        </Button>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">Business Registration</p>
                        <p className="text-xs text-gray-500 mt-1">CAC Certificate or equivalent (max 5MB)</p>
                        <Button className="mt-3" style={{ background: '#FF9900', color: '#0f1111' }}>
                          Choose File
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <div className={`border rounded-lg p-6 ${isVerified ? 'bg-green-50 border-green-200' : verificationStatus === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <p className={`font-semibold mb-3 ${isVerified ? 'text-green-900' : verificationStatus === 'rejected' ? 'text-red-900' : 'text-yellow-900'}`}>
                        {isVerified ? '✓ Verification Passed' : verificationStatus === 'rejected' ? '✗ Verification Failed' : '⏳ Verification In Progress'}
                      </p>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>Photo ID verified</span>
                        </li>
                        <li className={`flex items-center gap-2 ${isVerified ? 'text-green-700' : 'text-gray-600'}`}>
                          <Circle className={`h-4 w-4 ${isVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                          <span>Address validation {isVerified ? 'passed' : 'in progress'}</span>
                        </li>
                        <li className={`flex items-center gap-2 ${isVerified ? 'text-green-700' : 'text-gray-600'}`}>
                          <Circle className={`h-4 w-4 ${isVerified ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>Business registration {isVerified ? 'verified' : 'pending'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                      <p className="text-sm text-indigo-900 font-medium">Ready to submit KYC application</p>
                      <p className="text-sm text-indigo-700 mt-2">
                        Your application will be reviewed by our verification team. You will receive email notification within 48 hours.
                      </p>
                      <div className="mt-4 p-3 bg-white rounded border border-indigo-100">
                        <p className="text-xs font-medium text-gray-700">Application Summary:</p>
                        <ul className="text-xs text-gray-600 mt-2 space-y-1">
                          <li>✓ Personal information complete</li>
                          <li>✓ Business details verified</li>
                          <li>✓ All documents uploaded and validated</li>
                        </ul>
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
                  disabled={currentStep === steps.length && !isVerified}
                >
                  {currentStep === steps.length ? (
                    isVerified ? 'Submit for Approval' : 'Verification Required'
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
