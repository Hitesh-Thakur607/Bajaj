const EDGE_PATTERN = /^[A-Z]->[A-Z]$/;

function parseEntry(entry) {
  if (typeof entry !== 'string') {
    return null;
  }

  const text = entry.trim();
  if (!EDGE_PATTERN.test(text)) {
    return { type: 'invalid', value: text };
  }

  const [parent, child] = text.split('->');
  if (parent === child) {
    return { type: 'invalid', value: text };
  }

  return { type: 'edge', value: text, parent, child };
}

function createNodeMap() {
  return new Map();
}

function addToMapList(map, key, value) {
  if (!map.has(key)) {
    map.set(key, []);
  }

  map.get(key).push(value);
}

function buildTree(root, childrenMap, path = new Set()) {
  path.add(root);

  const tree = {};
  const children = childrenMap.get(root) || [];

  for (const child of children) {
    if (!path.has(child)) {
      tree[child] = buildTree(child, childrenMap, path);
    }
  }

  path.delete(root);
  return tree;
}

function getDepth(root, childrenMap) {
  const children = childrenMap.get(root) || [];
  if (children.length === 0) {
    return 1;
  }

  let deepestChild = 0;
  for (const child of children) {
    deepestChild = Math.max(deepestChild, getDepth(child, childrenMap));
  }

  return deepestChild + 1;
}

function hasCycle(nodesInComponent, childrenMap) {
  const visiting = new Set();
  const visited = new Set();

  function visit(node) {
    if (visiting.has(node)) {
      return true;
    }

    if (visited.has(node)) {
      return false;
    }

    visiting.add(node);

    const children = childrenMap.get(node) || [];
    for (const child of children) {
      if (nodesInComponent.has(child) && visit(child)) {
        return true;
      }
    }

    visiting.delete(node);
    visited.add(node);
    return false;
  }

  for (const node of nodesInComponent) {
    if (visit(node)) {
      return true;
    }
  }

  return false;
}

function getComponent(startNode, neighborsMap, visited) {
  const stack = [startNode];
  const component = new Set();

  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) {
      continue;
    }

    visited.add(node);
    component.add(node);

    const neighbors = neighborsMap.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return component;
}

function processHierarchyRequest(data, identity = {}) {
  if (!Array.isArray(data)) {
    throw new Error('Request body must contain a data array.');
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const parentByChild = createNodeMap();
  const childrenByParent = createNodeMap();
  const neighbors = createNodeMap();
  const nodes = new Set();
  const nodeOrder = new Map();

  function addNode(node, index) {
    nodes.add(node);
    if (!nodeOrder.has(node)) {
      nodeOrder.set(node, index);
    }
  }

  data.forEach((entry, index) => {
    const item = parseEntry(entry);

    if (!item) {
      return;
    }

    if (item.type === 'invalid') {
      invalidEntries.push(item.value);
      return;
    }

    const { parent, child, value } = item;
    addNode(parent, index);
    addNode(child, index);

    if (seenEdges.has(value)) {
      duplicateEdges.push(value);
      return;
    }

    seenEdges.add(value);

    if (parentByChild.has(child)) {
      return;
    }

    parentByChild.set(child, parent);
    addToMapList(childrenByParent, parent, child);
    addToMapList(neighbors, parent, child);
    addToMapList(neighbors, child, parent);
  });

  const components = [];
  const visited = new Set();

  for (const node of nodes) {
    if (!visited.has(node)) {
      const component = getComponent(node, neighbors, visited);
      const firstSeen = Math.min(...[...component].map((name) => nodeOrder.get(name) ?? Number.MAX_SAFE_INTEGER));

      components.push({ component, firstSeen });
    }
  }

  components.sort((a, b) => a.firstSeen - b.firstSeen);

  const hierarchies = [];
  let totalCycles = 0;
  let largestTreeRoot = '';
  let largestTreeDepth = 0;

  for (const { component } of components) {
    if (hasCycle(component, childrenByParent)) {
      totalCycles += 1;
      hierarchies.push({
        root: [...component].sort()[0] || '',
        tree: {},
        has_cycle: true,
      });
      continue;
    }

    const childSet = new Set(parentByChild.keys());
    const roots = [...component].filter((node) => !childSet.has(node)).sort();
    const root = roots[0] || [...component].sort()[0] || '';
    const depth = getDepth(root, childrenByParent);

    hierarchies.push({
      root,
      tree: { [root]: buildTree(root, childrenByParent) },
      depth,
    });

    if (depth > largestTreeDepth || (depth === largestTreeDepth && root < largestTreeRoot)) {
      largestTreeDepth = depth;
      largestTreeRoot = root;
    }
  }

  return {
    user_id: identity.userId,
    email_id: identity.emailId,
    college_roll_number: identity.collegeRollNumber,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: hierarchies.length - totalCycles,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

module.exports = { processHierarchyRequest };