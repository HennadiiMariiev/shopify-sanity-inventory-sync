const getLocations = `
  {
    locations(first: 100) {
      nodes {
        name
        id
        address {
          countryCode
        }
      }
    }
  }
`;

const getInventoryLevelsByLocationId = `
    query($id: ID!) {
        location(id: $id){
            id
            inventoryLevels(first: 250) {
                nodes {
                    id
                    item {
                      id
                      variant {
                        id
                        title
                        inventoryQuantity
                      }
                    }
                }
            }
        }
    }
`;

const bulkOperationRunQuery = `
mutation {
    bulkOperationRunQuery(
      query:"""
      {
        locations(first: 50) {
          edges {
            node {
              id
              name
              address {
                countryCode
              }
              inventoryLevels(first:250) {
                edges {
                  node {
                    id
                    available
                    item {
                      id
                      variant {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      """
    ) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const bulkOperationResultQuery = `
query($id: ID!) {
  node(id: $id) {
    ... on BulkOperation {
      url
      partialDataUrl
    }
  }
}`;

export {
  getLocations,
  getInventoryLevelsByLocationId,
  bulkOperationRunQuery,
  bulkOperationResultQuery,
};
