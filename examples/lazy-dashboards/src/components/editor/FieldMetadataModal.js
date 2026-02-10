/**
 * @typedef {Object} FieldMetadata
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {string} role
 * @property {number} [nulls]
 * @property {number} [distinct]
 * @property {string|number} [min]
 * @property {string|number} [max]
 * @property {string[]} [samples]
 * @property {string} [inference]
 */

/**
 * @typedef {Object} FieldMetadataModalProps
 * @property {boolean} isOpen
 * @property {FieldMetadata[]} fields
 * @property {string} searchQuery
 * @property {(value: string) => void} onSearchChange
 * @property {string} selectedRole
 * @property {(value: string) => void} onRoleChange
 * @property {() => void} onClose
 * @property {() => void} onSave
 */

/**
 * Modal for reviewing and filtering field metadata details.
 *
 * @param {FieldMetadataModalProps} props
 * @returns {JSX.Element|null}
 */
const FieldMetadataModal = ({
  isOpen,
  fields,
                              searchQuery,
                              onSearchChange,
                              selectedRole,
                              onRoleChange,
                              onClose,
                              onSave,
                            }) => {
  if (!isOpen) {
    return null;
  }

  // Filter fields based on search and role
  const filteredFields = fields.filter(field => {
    const matchesSearch = !searchQuery ||
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'All' || field.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="lazy-modal__backdrop" role="dialog" aria-modal="true">
      <div className="lazy-modal lazy-modal--compact lazy-modal--fields">
        {/* Header */}
        <div className="lazy-modal__header">
          <div>
            <p className="lazy-modal__eyebrow">Dataset Fields</p>
            <h2 className="lazy-modal__title">Edit field metadata</h2>
          </div>
          <button
            className="lazy-button ghost"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="lazy-modal__body">
          {/* Search and Filter Controls */}
          <div className="lazy-field-controls">
            <div className="lazy-input">
              <label className="lazy-input__label" htmlFor="field-search">
                Search
              </label>
              <input
                id="field-search"
                className="lazy-input__field"
                type="text"
                placeholder="Filter by name or id"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <div className="lazy-input">
              <label className="lazy-input__label" htmlFor="field-role">
                Role
              </label>
              <select
                id="field-role"
                className="lazy-input__field"
                value={selectedRole}
                onChange={(e) => onRoleChange(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Dimension">Dimension</option>
                <option value="Metric">Metric</option>
              </select>
            </div>
          </div>

          {/* Field List */}
          <div className="lazy-field-list">
            {filteredFields.map((field) => (
              <div key={field.id} className="lazy-field-card">
                {/* Field Header */}
                <div className="lazy-field-card__header">
                  <div className="lazy-field-card__name">
                    {field.name}
                  </div>
                  <div className="lazy-field-card__type">
                    {field.type}
                  </div>
                  <div className="lazy-field-card__role">
                    {field.role}
                  </div>
                </div>

                {/* Field Metadata */}
                <div className="lazy-field-card__meta">
                  <div className="lazy-field-card__meta-item">
                    <span className="lazy-field-card__meta-label">Id:</span>
                    <span>{field.id}</span>
                  </div>
                  {field.nulls !== undefined && (
                    <div className="lazy-field-card__meta-item">
                      <span className="lazy-field-card__meta-label">Nulls:</span>
                      <span>{field.nulls}%</span>
                    </div>
                  )}
                  {field.distinct !== undefined && (
                    <div className="lazy-field-card__meta-item">
                      <span className="lazy-field-card__meta-label">Distinct:</span>
                      <span>{field.distinct.toLocaleString()}</span>
                    </div>
                  )}
                  {field.min !== undefined && field.min !== 'N/A' && (
                    <div className="lazy-field-card__meta-item">
                      <span className="lazy-field-card__meta-label">Min:</span>
                      <span>{field.min}</span>
                    </div>
                  )}
                  {field.max !== undefined && field.max !== 'N/A' && (
                    <div className="lazy-field-card__meta-item">
                      <span className="lazy-field-card__meta-label">Max:</span>
                      <span>{field.max}</span>
                    </div>
                  )}
                </div>

                {/* Sample Values */}
                {field.samples && field.samples.length > 0 && (
                  <div className="lazy-field-card__samples">
                    <strong style={{ color: 'var(--radf-text-secondary)', marginBottom: '6px', display: 'block', fontSize: '0.8rem' }}>
                      Samples:
                    </strong>
                    {field.samples.join(', ')}
                  </div>
                )}

                {/* Inference Note */}
                {field.inference && (
                  <div className="lazy-field-card__inference">
                    {field.inference}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredFields.length === 0 && (
            <div className="lazy-empty">
              <p>No fields match your search criteria.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="lazy-modal__footer">
          <button
            className="lazy-button ghost"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="lazy-button"
            type="button"
            onClick={onSave}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldMetadataModal;
