import { getVizManifest } from './vizManifest.js';

/**
 * @typedef {Object} WidgetValidationResult
 * @property {'valid'|'draft'} status
 * @property {string[]} errors
 */

/**
 * @typedef {Object} ModelValidationResult
 * @property {boolean} isValid
 * @property {Object<string, WidgetValidationResult>} widgets
 */

/**
 * Checks if a value is non-empty for validation purposes.
 *
 * @param {unknown} value
 * @returns {boolean} True when the value is considered present.
 */
const isNonEmptyValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== '';
};

/**
 * Reads required encodings from the viz manifest.
 *
 * @param {string} vizType
 * @returns {Object[]} Required encoding definitions.
 */
const getRequiredEncodings = (vizType) => {
  const manifest = getVizManifest(vizType);
  return manifest?.encodings?.required || [];
};

/**
 * Validates widget layout bounds.
 *
 * @param {Object} layout
 * @returns {string|null} An error message when invalid.
 */
const validateLayout = (layout) => {
  if (!layout) {
    return 'Layout is required.';
  }
  const { x, y, w, h } = layout;
  if (![x, y, w, h].every((value) => Number.isFinite(value))) {
    return 'Layout must include x, y, w, h numbers.';
  }
  if (w <= 0 || h <= 0) {
    return 'Layout width and height must be positive.';
  }
  return null;
};

/**
 * Validates a widget and returns its status and errors.
 *
 * @param {Object} widget
 * @returns {WidgetValidationResult} The validation result.
 */
export const validateWidget = (widget) => {
  const errors = [];
  if (!widget?.id) {
    errors.push('Widget needs a stable id.');
  }
  if (!widget?.panelType) {
    errors.push('Panel type is required.');
  }
  if (widget?.panelType === 'viz' && !widget?.vizType) {
    errors.push('Viz type is required.');
  }
  const layoutError = validateLayout(widget?.layout);
  if (layoutError) {
    errors.push(layoutError);
  }
  if (widget?.panelType === 'viz') {
    const required = getRequiredEncodings(widget?.vizType);
    required.forEach((encoding) => {
      if (!isNonEmptyValue(widget?.encodings?.[encoding.id])) {
        errors.push(`Missing ${encoding.label || encoding.id} encoding.`);
      }
    });
  }
  const status =
    widget?.draft || errors.length > 0 ? 'draft' : 'valid';
  return { status, errors };
};

/**
 * Validates all widgets in an authoring model.
 *
 * @param {Object} model
 * @returns {ModelValidationResult} The validation result.
 */
export const validateAuthoringModel = (model) => {
  const widgets = Array.isArray(model?.widgets) ? model.widgets : [];
  const widgetsById = {};
  let hasErrors = false;
  widgets.forEach((widget) => {
    const result = validateWidget(widget);
    if (result.errors.length > 0 || result.status === 'draft') {
      hasErrors = true;
    }
    widgetsById[widget.id] = result;
  });
  return {
    isValid: !hasErrors,
    widgets: widgetsById,
  };
};
