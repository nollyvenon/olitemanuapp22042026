'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronRight, TrendingUp } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Select Market/Category',
    description: 'Choose market segment to analyze',
    guidance: 'Markets are defined by product categories and customer segments. Select the market most relevant to your business question.',
  },
  {
    id: 2,
    title: 'Choose Metrics',
    description: 'Select which KPIs to analyze',
    guidance: 'Key metrics: Sales Volume (units sold), Revenue, Growth Rate (% change), Market Share, Customer Count. Select multiple metrics for comparison.',
  },
  {
    id: 3,
    title: 'Set Time Period',
    description: 'Configure analysis time range',
    guidance: 'Compare periods: Month-on-Month (MoM) shows recent trends, Year-on-Year (YoY) shows seasonal patterns. 12-month minimum recommended.',
  },
  {
    id: 4,
    title: 'Apply Filters',
    description: 'Narrow analysis by region, channel, or segment',
    guidance: 'Filters help identify patterns: Lagos only, Retail channel only, etc. Multiple filters supported. Use "All" if no filter needed.',
  },
  {
    id: 5,
    title: 'Generate Insights',
    description: 'AI analyzes data and generates recommendations',
    guidance: 'AI identifies trends (rising/falling), opportunities (gaps), threats (competition), and actionable recommendations. Insights update weekly.',
  },
];

export default function MarketIntelligenceWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['volume']);

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
        title="Guided Workflow: Market Intelligence Analysis"
        description="Step-by-step guide to analyzing market trends and generating business insights"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Steps Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Analysis Steps</h3>
            <div className="space-y-3">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? 'bg-emerald-50 border-l-4 border-emerald-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle
                        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          currentStep === step.id ? 'text-emerald-600' : 'text-gray-400'
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

            {/* Analysis Info */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs font-medium text-gray-700 mb-3">Configuration</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market:</span>
                  <span className="font-semibold text-gray-900">All Categories</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Metrics:</span>
                  <span className="font-semibold text-gray-900">{selectedMetrics.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-semibold text-gray-900">12 Months</span>
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
                <span className="text-sm font-medium text-emerald-600">
                  Step {currentStepData.id} of {steps.length}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{currentStepData.title}</h2>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-emerald-900">
                  <span className="font-semibold">💡 Tip:</span> {currentStepData.guidance}
                </p>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData.id === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select market to analyze:</p>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="market" defaultChecked className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">All Categories</p>
                          <p className="text-xs text-gray-500">Comprehensive market overview across all product types</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="market" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Electronics & Technology</p>
                          <p className="text-xs text-gray-500">Computing devices, networking, software</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="market" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Consumables</p>
                          <p className="text-xs text-gray-500">Supplies, office materials, stationery</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="market" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Hardware & Equipment</p>
                          <p className="text-xs text-gray-500">Machinery, tools, industrial equipment</p>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="market" className="mr-3" />
                        <div>
                          <p className="font-medium text-sm">Custom Segment</p>
                          <p className="text-xs text-gray-500">Create custom market based on specific criteria</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {currentStepData.id === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Select metrics to analyze (choose multiple):</p>
                    <div className="space-y-2">
                      {[
                        { id: 'volume', label: 'Sales Volume', desc: 'Units sold in the market' },
                        { id: 'revenue', label: 'Revenue', desc: 'Total monetary value of sales' },
                        { id: 'growth', label: 'Growth Rate', desc: 'Month-on-month or year-on-year % change' },
                        { id: 'share', label: 'Market Share', desc: 'Your % of total market volume' },
                        { id: 'customers', label: 'Customer Count', desc: 'Number of active customers' },
                        { id: 'trend', label: 'Market Trend', desc: 'Overall market direction (up/down/stable)' },
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
                    <p className="text-sm text-gray-600 mb-4">Configure analysis period:</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
                        <option>Last 3 Months</option>
                        <option>Last 6 Months</option>
                        <option selected>Last 12 Months</option>
                        <option>Last 24 Months</option>
                        <option>Custom Date Range</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comparison Method</label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="comparison" defaultChecked className="mr-3" />
                          <div>
                            <p className="font-medium text-sm">Month-on-Month (MoM)</p>
                            <p className="text-xs text-gray-500">Shows recent momentum and short-term trends</p>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="comparison" className="mr-3" />
                          <div>
                            <p className="font-medium text-sm">Year-on-Year (YoY)</p>
                            <p className="text-xs text-gray-500">Shows seasonal patterns and long-term growth</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {currentStepData.id === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">Apply filters (optional):</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Region</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
                        <option>All Regions</option>
                        <option>Lagos</option>
                        <option>Abuja</option>
                        <option>Port Harcourt</option>
                        <option>South West</option>
                        <option>South South</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Channel</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4">
                        <option>All Channels</option>
                        <option>Direct Sales</option>
                        <option>Distributor</option>
                        <option>Retail</option>
                        <option>Online</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Segment</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>All Segments</option>
                        <option>Enterprise</option>
                        <option>SME</option>
                        <option>Retail</option>
                        <option>Government</option>
                      </select>
                    </div>
                  </div>
                )}

                {currentStepData.id === 5 && (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        <p className="font-semibold text-emerald-900">AI Insights Ready</p>
                      </div>
                      <p className="text-sm text-emerald-700 mb-4">
                        Your market intelligence analysis will be generated including:
                      </p>
                      <ul className="text-sm text-emerald-700 space-y-2 ml-4">
                        <li>✓ Market trend analysis and direction</li>
                        <li>✓ Growth opportunities identification</li>
                        <li>✓ Competitive threats assessment</li>
                        <li>✓ Customer behavior patterns</li>
                        <li>✓ Actionable recommendations</li>
                        <li>✓ Forecasting for next quarter</li>
                      </ul>
                    </div>
                    <p className="text-xs text-gray-600 mt-4">
                      Processing time: 30-60 seconds. You will receive a dashboard with interactive charts and detailed insights.
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
                >
                  {currentStep === steps.length ? (
                    'Generate Insights'
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
