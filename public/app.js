const input = document.getElementById('input');
const submitButton = document.getElementById('submit');
const sampleButton = document.getElementById('sample');
const status = document.getElementById('status');
const responseJson = document.getElementById('responseJson');

const samplePayload = {
  data: [
    'A->B',
    'A->C',
    'B->D',
    'C->E',
    'E->F',
    'X->Y',
    'Y->X',
    'P->Q',
    'Q->R',
    'hello',
    '1->2',
    'A->B',
  ],
};

async function submitPayload() {
  status.textContent = 'Submitting request...';

  let payload;
  try {
    payload = JSON.parse(input.value);
  } catch {
    status.textContent = 'The payload is not valid JSON.';
    return;
  }

  try {
    const response = await fetch('/bfh1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    responseJson.textContent = JSON.stringify(data, null, 2);
    status.textContent = 'Request completed successfully.';
  } catch (error) {
    status.textContent = error.message || 'Something went wrong.';
  }
}

sampleButton.addEventListener('click', () => {
  input.value = JSON.stringify(samplePayload, null, 2);
  status.textContent = 'Challenge sample loaded.';
});

submitButton.addEventListener('click', submitPayload);
responseJson.textContent = '{\n  "user_id": "",\n  "email_id": "",\n  "college_roll_number": "",\n  "hierarchies": [],\n  "invalid_entries": [],\n  "duplicate_edges": [],\n  "summary": {\n    "total_trees": 0,\n    "total_cycles": 0,\n    "largest_tree_root": ""\n  }\n}';