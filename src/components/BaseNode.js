// src/components/BaseNode.js
class BaseNode {
  constructor(id, type, position, data = {}) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.data = {
      ...data,
      handleNodeChange: data.handleNodeChange,
      handleDelete: data.handleDelete,
      inputs: data.inputs || [],
      outputs: data.outputs || [],
      isRange: data.isRange || false, // For InputNode to indicate range
    };
  }

  setType(type) {
    this.type = type;
    switch (type) {
      case 'inputNode':
        this.data = {
          ...this.data,
          label: `Input Node`,
          isRange: false,
          dataType: 'single', // Deprecated, removing as per requirements
        };
        break;
      case 'calculationNode':
        this.data = {
          ...this.data,
          label: 'Calculation Node',
          processType: '',
          inputs: [],
        };
        break;
      case 'conditionalNode':
        this.data = {
          ...this.data,
          label: 'Conditional Node',
          condition: '',
          inputs: [],
        };
        break;
      case 'selectTypeNode':
        this.data = {
          ...this.data,
          // No additional data needed for selectTypeNode
        };
        break;
      default:
        break;
    }
  }

  addInput(sourceId) {
    if (!this.data.inputs.includes(sourceId)) {
      this.data.inputs.push(sourceId);
      this.data.isConnected = true;
    }
  }

  removeInput(sourceId) {
    this.data.inputs = this.data.inputs.filter((id) => id !== sourceId);
    this.data.isConnected = this.data.inputs.length > 0;
  }

  addOutput(targetId) {
    if (!this.data.outputs.includes(targetId)) {
      this.data.outputs.push(targetId);
    }
  }

  removeOutput(targetId) {
    this.data.outputs = this.data.outputs.filter((id) => id !== targetId);
  }

  handleChange(field, value) {
    this.data[field] = value;
  }

  toggleRange() {
    this.data.isRange = !this.data.isRange;
  }

  toNodeObject() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      data: this.data,
    };
  }
}

export default BaseNode;