class BaseNode {
    constructor(id, type, position, data = {}) {
      this.id = id;
      this.type = type;
      this.position = position;
      this.data = {
        ...data,
        handleNodeChange: data.handleNodeChange,
        handleDelete: data.handleDelete,
        isConnected: false,
      };
    }
  
    setType(type) {
      this.type = type;
      switch (type) {
        case 'inputNode':
          this.data = {
            ...this.data,
            label: `Input Node`,
            value: '',
            dataType: 'single',
            from: '',
            to: '',
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
        default:
          break;
      }
    }
  
    handleChange(field, value) {
      this.data[field] = value;
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