// Helper function to format dates to dd/mm/yyyy
function formatDate(date) {
  if (!date) return null;

  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

module.exports = { formatDate };
