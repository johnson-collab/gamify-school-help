export default function handler(req, res) {
  const assignments = [
    { title: "Math Homework", subject: "Math" },
    { title: "Science Project", subject: "Science" },
  ];

  res.status(200).json(assignments);
}
