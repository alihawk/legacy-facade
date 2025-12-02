/**
 * SchemaReviewStep Component
 * 
 * Main container for Step 1: Schema Review
 * Allows users to review and customize detected resources before proceeding.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useSchemaContext } from '../../context/SchemaContext';
import { ReviewedResource } from '../../types/schemaTypes';
import { ResourceCard } from './ResourceCard';

export function SchemaReviewStep() {
  const navigate = useNavigate();
  const { 
    detectedSchema, 
    reviewedSchema, 
    setReviewedSchema,
    convertDetectedToReviewed 
  } = useSchemaContext();
  
  const [resources, setResources] = useState<ReviewedResource[]>([]);

  // Initialize from detected schema
  useEffect(() => {
    if (reviewedSchema) {
      setResources(reviewedSchema);
    } else if (detectedSchema) {
      setResources(convertDetectedToReviewed(detectedSchema));
    }
  }, [detectedSchema, reviewedSchema, convertDetectedToReviewed]);

  // Redirect if no schema
  useEffect(() => {
    if (!detectedSchema && !reviewedSchema) {
      navigate('/');
    }
  }, [detectedSchema, reviewedSchema, navigate]);

  const handleResourceChange = (index: number, updated: ReviewedResource) => {
    const newResources = [...resources];
    newResources[index] = updated;
    setResources(newResources);
  };

  const handleResourceDelete = (index: number) => {
    if (resources.length <= 1) {
      alert('You must have at least one resource');
      return;
    }
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleAddResource = () => {
    setResources([
      ...resources,
      {
        name: `resource_${resources.length + 1}`,
        displayName: `Resource ${resources.length + 1}`,
        endpoint: '',
        primaryKey: 'id',
        operations: {
          list: true,
          detail: true,
          create: true,
          update: true,
          delete: true,
        },
        fields: [
          {
            name: 'id',
            displayName: 'ID',
            type: 'number',
            isPrimaryKey: true,
            isVisible: true,
            isRequired: true,
          },
        ],
      },
    ]);
  };

  const handleNext = () => {
    // Validate
    const hasErrors = resources.some(r => 
      !r.name || !r.endpoint || r.fields.length === 0 ||
      !r.fields.some(f => f.isPrimaryKey)
    );
    
    if (hasErrors) {
      alert('Please ensure all resources have a name, endpoint, at least one field, and a primary key');
      return;
    }

    setReviewedSchema(resources);
    navigate('/customize');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Step 1 of 2</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Review Detected Schema</h1>
          <p className="text-gray-600 mt-1">
            We analyzed your API and detected the following. Review and adjust as needed before generating your portal.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Tip: Fine-tune your schema</p>
            <p className="mt-1">
              Enable/disable operations, change field types (e.g., string → email), 
              hide internal fields, or add missing ones.
            </p>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <ResourceCard
              key={index}
              resource={resource}
              onChange={(updated) => handleResourceChange(index, updated)}
              onDelete={() => handleResourceDelete(index)}
            />
          ))}
        </div>

        {/* Add Resource */}
        <button
          onClick={handleAddResource}
          className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Resource
        </button>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center pt-6 border-t">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Analysis
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Next Step
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
