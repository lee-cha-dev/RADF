import DatasetImporter from '../DatasetImporter.jsx';

const DatasetPanel = ({ datasetBinding, onDatasetUpdate }) => (
  <section className="lazy-panel">
    <h2 className="lazy-panel__title">Dataset</h2>
    <p className="lazy-panel__body">
      Import data and optionally define metrics and dimensions.
    </p>
    <DatasetImporter
      datasetBinding={datasetBinding}
      onUpdate={onDatasetUpdate}
    />
  </section>
);

export default DatasetPanel;
