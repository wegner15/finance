import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Copy from 'lucide-react/dist/esm/icons/copy';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  dueDate: string;
}

interface QuoteFormData {
  title: string;
  companyId: string;
  clientId: string;
  projectId: string;
  introduction: string;
  scope: string;
  lineItems: LineItem[];
  paymentMilestones: PaymentMilestone[];
  terms: string;
  validityDays: number;
}

interface QuoteBuilderProps {
  companies: any[];
  clients: any[];
  projects: any[];
  onCancel: () => void;
  initialData?: Partial<QuoteFormData>;
  quoteId?: string;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  companies,
  clients,
  projects,
  onCancel,
  initialData,
  quoteId,
}) => {
  const [formData, setFormData] = useState<QuoteFormData>({
    title: initialData?.title || '',
    companyId: initialData?.companyId || '',
    clientId: initialData?.clientId || '',
    projectId: initialData?.projectId || '',
    introduction: initialData?.introduction || '',
    scope: initialData?.scope || '',
    lineItems: initialData?.lineItems || [],
    paymentMilestones: initialData?.paymentMilestones || [],
    terms: initialData?.terms || '',
    validityDays: initialData?.validityDays || 30,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateLineItemTotal = (item: LineItem) => item.quantity * item.rate;

  const calculateSubtotal = () =>
    formData.lineItems.reduce((sum, item) => sum + calculateLineItemTotal(item), 0);

  const calculateMilestoneAmount = (percentage: number) =>
    (calculateSubtotal() * percentage) / 100;

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        { id: Date.now().toString(), description: '', quantity: 1, rate: 0 },
      ],
    }));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeLineItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const duplicateLineItem = (id: string) => {
    const item = formData.lineItems.find((i) => i.id === id);
    if (item) {
      setFormData((prev) => ({
        ...prev,
        lineItems: [
          ...prev.lineItems,
          { ...item, id: Date.now().toString() },
        ],
      }));
    }
  };

  const addPaymentMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      paymentMilestones: [
        ...prev.paymentMilestones,
        {
          id: Date.now().toString(),
          name: '',
          percentage: 0,
          dueDate: '',
        },
      ],
    }));
  };

  const updatePaymentMilestone = (
    id: string,
    field: keyof PaymentMilestone,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      paymentMilestones: prev.paymentMilestones.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone
      ),
    }));
  };

  const removePaymentMilestone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMilestones: prev.paymentMilestones.filter(
        (milestone) => milestone.id !== id
      ),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Quote title is required';
    if (!formData.companyId) newErrors.companyId = 'Company is required';
    if (!formData.clientId) newErrors.clientId = 'Client is required';
    if (formData.lineItems.length === 0)
      newErrors.lineItems = 'At least one line item is required';
    if (
      formData.lineItems.some(
        (item) => !item.description.trim() || item.quantity <= 0 || item.rate <= 0
      )
    )
      newErrors.lineItems = 'All line items must have description, quantity > 0, and rate > 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formElement = e.currentTarget as HTMLFormElement;
    const fd = new FormData(formElement);

    fd.set('data', JSON.stringify(formData));

    try {
      const response = await fetch(quoteId ? `/quotes/${quoteId}` : '/quotes', {
        method: quoteId ? 'PUT' : 'POST',
        body: fd,
      });

      if (response.ok) {
        window.location.href = '/quotes';
      } else {
        alert('Failed to save quote');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Error saving quote');
    }
  };

  const subtotal = calculateSubtotal();

  // Serialize data as hidden fields for server submission
  const serializeData = () => {
    return JSON.stringify({
      ...formData,
      lineItems: formData.lineItems,
      paymentMilestones: formData.paymentMilestones,
    });
  };

  return (
    <div className="space-y-8">
      <form action={quoteId ? `/quotes/${quoteId}` : '/quotes'} method="post" className="space-y-8">
        {/* Header Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="text-2xl">Quote Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Quote Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Website Redesign Project"
                  className={`h-11 ${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Validity Period (days)
                </label>
                <Input
                  name="validity_period"
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validityDays: parseInt(e.target.value) || 30,
                    }))
                  }
                  min="1"
                  max="365"
                  className="h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Company *
                </label>
                <select
                  name="company_id"
                  value={formData.companyId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, companyId: e.target.value }))
                  }
                  className={`w-full h-11 px-3 rounded-md border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${
                    errors.companyId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                  }`}
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Client *
                </label>
                <select
                  name="client_id"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientId: e.target.value }))
                  }
                  className={`w-full h-11 px-3 rounded-md border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${
                    errors.clientId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                  }`}
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Project (Optional)
                </label>
                <select
                  name="project_id"
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, projectId: e.target.value }))
                  }
                  className="w-full h-11 px-3 rounded-md border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Introduction & Scope */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Introduction & Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Introduction
              </label>
              <Textarea
                name="introduction"
                value={formData.introduction}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, introduction: e.target.value }))
                }
                placeholder="Introduce the project and your company..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Project Scope
              </label>
              <Textarea
                name="scope_summary"
                value={formData.scope}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, scope: e.target.value }))
                }
                placeholder="Describe what's included in this project..."
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="border-0 shadow-lg border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-gray-900 dark:text-white">Line Items</CardTitle>
            <div dangerouslySetInnerHTML={{__html: `
              <button
                type="button"
                onclick="addLineItemHandler()"
                class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Item
              </button>
            `}} />
          </CardHeader>
          <CardContent>
            <div className="line-items-container space-y-4">
              {formData.lineItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No line items yet</p>
                  <Button
                    type="button"
                    onClick={addLineItem}
                    variant="outline"
                  >
                    Add your first item
                  </Button>
                </div>
              ) : (
                formData.lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                        Item {index + 1}
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => duplicateLineItem(item.id)}
                          size="sm"
                          variant="outline"
                          title="Duplicate item"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Description *
                        </label>
                        <Textarea
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(item.id, 'description', e.target.value)
                          }
                          placeholder="What is this item?"
                          rows={2}
                          className="resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Quantity *
                          </label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                'quantity',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="h-10"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Rate (KSH) *
                          </label>
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                'rate',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                            className="h-10"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                            Total
                          </label>
                          <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border-2 border-gray-200 dark:border-gray-700 font-semibold">
                            KSH {calculateLineItemTotal(item).toLocaleString('en', {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Subtotal */}
              {formData.lineItems.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="flex justify-end">
                    <div className="w-full md:w-1/3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Subtotal:</span>
                        <span className="text-green-600 dark:text-green-400">
                          KSH {subtotal.toLocaleString('en', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {errors.lineItems && (
              <p className="text-red-500 text-sm mt-2">{errors.lineItems}</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Milestones */}
        <Card className="border-0 shadow-lg border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-gray-900 dark:text-white">Payment Milestones</CardTitle>
            <div dangerouslySetInnerHTML={{__html: `
              <button
                type="button"
                onclick="addMilestoneHandler()"
                class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Milestone
              </button>
            `}} />
          </CardHeader>
          <CardContent>
            <div className="milestones-container space-y-4">
              {formData.paymentMilestones.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No payment milestones yet</p>
                  <Button
                    type="button"
                    onClick={addPaymentMilestone}
                    variant="outline"
                  >
                    Add your first milestone
                  </Button>
                </div>
              ) : (
                formData.paymentMilestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                        Milestone {index + 1}
                      </h4>
                      <Button
                        type="button"
                        onClick={() => removePaymentMilestone(milestone.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Milestone Name
                        </label>
                        <Input
                          value={milestone.name}
                          onChange={(e) =>
                            updatePaymentMilestone(
                              milestone.id,
                              'name',
                              e.target.value
                            )
                          }
                          placeholder="e.g., Initial Deposit"
                          className="h-10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Percentage of Total
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={milestone.percentage}
                            onChange={(e) =>
                              updatePaymentMilestone(
                                milestone.id,
                                'percentage',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            max="100"
                            step="0.01"
                            className="h-10"
                          />
                          <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border-2 border-gray-200 dark:border-gray-700 font-semibold whitespace-nowrap">
                            KSH {calculateMilestoneAmount(milestone.percentage).toLocaleString('en', {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                          Due Date
                        </label>
                        <Input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) =>
                            updatePaymentMilestone(
                              milestone.id,
                              'dueDate',
                              e.target.value
                            )
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              value={formData.terms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, terms: e.target.value }))
              }
              placeholder="Payment terms, conditions, warranty information, etc."
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-8">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Preview
              </>
            )}
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Save Quote
          </Button>
        </div>
      </form>

      {/* Preview Section */}
      {showPreview && (
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="bg-gray-50 dark:bg-gray-900">
            <CardTitle>Quote Preview</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold mb-2">{formData.title || 'Quote Title'}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Valid for {formData.validityDays} days
                </p>
              </div>

              {/* Introduction */}
              {formData.introduction && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {formData.introduction}
                  </p>
                </div>
              )}

              {/* Scope */}
              {formData.scope && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Project Scope</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {formData.scope}
                  </p>
                </div>
              )}

              {/* Line Items */}
              {formData.lineItems.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Cost Breakdown</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                          <th className="text-left py-2 px-4 font-semibold">Description</th>
                          <th className="text-right py-2 px-4 font-semibold">Qty</th>
                          <th className="text-right py-2 px-4 font-semibold">Rate</th>
                          <th className="text-right py-2 px-4 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.lineItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-3 px-4">{item.description}</td>
                            <td className="text-right py-3 px-4">{item.quantity}</td>
                            <td className="text-right py-3 px-4">
                              KSH {item.rate.toLocaleString('en', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="text-right py-3 px-4 font-semibold">
                              KSH {calculateLineItemTotal(item).toLocaleString('en', {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                          <td colSpan={3} className="text-right py-3 px-4">
                            Subtotal:
                          </td>
                          <td className="text-right py-3 px-4 text-green-600 dark:text-green-400">
                            KSH {subtotal.toLocaleString('en', {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Milestones */}
              {formData.paymentMilestones.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Payment Schedule</h2>
                  <div className="space-y-3">
                    {formData.paymentMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold">{milestone.name}</p>
                          {milestone.dueDate && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Due: {new Date(milestone.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {milestone.percentage}%
                          </p>
                          <p className="text-green-600 dark:text-green-400 font-bold">
                            KSH {calculateMilestoneAmount(milestone.percentage).toLocaleString('en', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms */}
              {formData.terms && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Terms & Conditions</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {formData.terms}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuoteBuilder;
