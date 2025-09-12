import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Card from '../common/Card';

function ConfigForm({ 
  config, 
  onSave, 
  onCancel, 
  isLoading, 
  validationResult 
}) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    type: 'standard',
    initialEntries: [],
    visualization: {
      type: 'scatter',
      xAxis: { field: 'x', label: 'X Axis' },
      yAxis: { field: 'y', label: 'Y Axis' }
    },
    ...config
  });
  
  const [errors, setErrors] = useState({});
  
  // Update form data when config changes
  useEffect(() => {
    if (config) {
      setFormData(prevData => ({
        ...prevData,
        ...config
      }));
    }
  }, [config]);
  
  // Update errors when validation result changes
  useEffect(() => {
    if (validationResult && !validationResult.valid) {
      setErrors(validationResult.errors || {});
    } else {
      setErrors({});
    }
  }, [validationResult]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleNestedChange = (section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="config-form">
      <Card title="Basic Information">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            required
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="type" className="form-label">Type</label>
          <select
            id="type"
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="standard">Standard</option>
            <option value="timeline">Timeline</option>
            <option value="comparison">Comparison</option>
          </select>
          {errors.type && <div className="form-error">{errors.type}</div>}
        </div>
      </Card>
      
      <Card title="Visualization">
        <div className="form-group">
          <label htmlFor="visualization-type" className="form-label">Visualization Type</label>
          <select
            id="visualization-type"
            name="visualization-type"
            className="form-control"
            value={formData.visualization?.type || 'scatter'}
            onChange={(e) => handleNestedChange('visualization', 'type', e.target.value)}
          >
            <option value="scatter">Scatter Plot</option>
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
          {errors['visualization.type'] && <div className="form-error">{errors['visualization.type']}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="x-axis-field" className="form-label">X-Axis Field</label>
            <input
              type="text"
              id="x-axis-field"
              className="form-control"
              value={formData.visualization?.xAxis?.field || 'x'}
              onChange={(e) => handleNestedChange('visualization', 'xAxis', {
                ...formData.visualization?.xAxis,
                field: e.target.value
              })}
            />
            {errors['visualization.xAxis.field'] && <div className="form-error">{errors['visualization.xAxis.field']}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="x-axis-label" className="form-label">X-Axis Label</label>
            <input
              type="text"
              id="x-axis-label"
              className="form-control"
              value={formData.visualization?.xAxis?.label || 'X Axis'}
              onChange={(e) => handleNestedChange('visualization', 'xAxis', {
                ...formData.visualization?.xAxis,
                label: e.target.value
              })}
            />
            {errors['visualization.xAxis.label'] && <div className="form-error">{errors['visualization.xAxis.label']}</div>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="y-axis-field" className="form-label">Y-Axis Field</label>
            <input
              type="text"
              id="y-axis-field"
              className="form-control"
              value={formData.visualization?.yAxis?.field || 'y'}
              onChange={(e) => handleNestedChange('visualization', 'yAxis', {
                ...formData.visualization?.yAxis,
                field: e.target.value
              })}
            />
            {errors['visualization.yAxis.field'] && <div className="form-error">{errors['visualization.yAxis.field']}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="y-axis-label" className="form-label">Y-Axis Label</label>
            <input
              type="text"
              id="y-axis-label"
              className="form-control"
              value={formData.visualization?.yAxis?.label || 'Y Axis'}
              onChange={(e) => handleNestedChange('visualization', 'yAxis', {
                ...formData.visualization?.yAxis,
                label: e.target.value
              })}
            />
            {errors['visualization.yAxis.label'] && <div className="form-error">{errors['visualization.yAxis.label']}</div>}
          </div>
        </div>
      </Card>
      
      {/* This is a simplified form. In a real application, we would have more fields
          for entries, categories, styling options, etc. */}
      
      <div className="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading}
          disabled={isLoading}
        >
          Save Configuration
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default ConfigForm;

// Made with Bob
