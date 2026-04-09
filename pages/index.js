import React, { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");

  const [tasks, setTasks] = useState([]);
  const [boss, setBoss] = useState(null);
  const [input, setInput] = useState("");
  const [classroomTasks, setClassroomTasks] = useState([]);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  const [subject, setSubject] = useState("General");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(savedUser);
      const data = JSON.parse(localStorage.getItem(savedUser));
      if (data) {
        setTasks(data.tasks || []);
        setXp(data.xp || 0);
        setLevel(data.level || 1);
        setStreak(data.streak || 0);
        setBoss(data.boss || null);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        user,
        JSON.stringify({ tasks, xp, level, streak, boss })
      );
    }
  }, [tasks, xp, level, streak, boss, user]);

  const login = () => {
    if (!usernameInput) return;
    setUser(usernameInput);
    localStorage.setItem("user", usernameInput);
  };

  const fetchClassroom = async () => {
    const res = await fetch("/api/classroom");
    const data = await res.json();
    setClassroomTasks(data);
  };

  const getXp = (difficulty) =>
    difficulty === "easy" ? 5 : difficulty === "hard" ? 25 : 10;

  const addTask = (difficulty) => {
    if (!input) return;
    setTasks([...tasks, { text: input, done: false, difficulty, subject }]);
    setInput("");
  };

  const createBoss = () => {
    if (!input) return;
    setBoss({ name: input, hp: 100, maxHp: 100 });
    setInput("");
  };

  const attackBoss = () => {
    if (!boss) return;
    const dmg = 10 + streak * 2;
    const newHp = Math.max(0, boss.hp - dmg);

    setBoss({ ...boss, hp: newHp });
    setXp(xp + dmg);
    setStreak(streak + 1);

    if (newHp === 0) {
      setBoss(null);
      setXp(xp + 50);
    }
  };

  const completeTask = (i) => {
    const updated = [...tasks];
    if (!updated[i].done) {
      updated[i].done = true;
      const gained = getXp(updated[i].difficulty);
      const newXp = xp + gained + streak * 2;

      setXp(newXp);
      setStreak(streak + 1);

      if (newXp >= level * 50) setLevel(level + 1);
    }
    setTasks(updated);
  };

  if (!user) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div>
          <h2>Enter Name</h2>
          <input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />
          <button onClick={login}>Start</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{user}'s RPG School</h1>

      <p>Level: {level} | XP: {xp} | 🔥 {streak}</p>

      {boss && (
        <div>
          <h2>Boss: {boss.name}</h2>
          <div style={{ background: "gray", height: 10 }}>
            <div style={{ background: "red", width: `${(boss.hp / boss.maxHp) * 100}%`, height: 10 }} />
          </div>
          <button onClick={attackBoss}>Attack</button>
        </div>
      )}

      <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Task or Boss" />

      <div>
        <button onClick={() => addTask("easy")}>Easy</button>
        <button onClick={() => addTask("medium")}>Medium</button>
        <button onClick={() => addTask("hard")}>Hard</button>
        <button onClick={createBoss}>Boss</button>
      </div>

      <div>
        <button onClick={() => setSubject("Math")}>Math</button>
        <button onClick={() => setSubject("Science")}>Science</button>
        <button onClick={() => setSubject("English")}>English</button>
      </div>

      <h3>Your Tasks</h3>
      {tasks.map((t, i) => (
        <div key={i}>
          [{t.subject}] {t.text}
          <button onClick={() => completeTask(i)}>✔</button>
        </div>
      ))}

      <h3>Classroom</h3>
      <button onClick={fetchClassroom}>Sync Classroom</button>
      {classroomTasks.map((t, i) => (
        <div key={i}>{t.title} ({t.subject})</div>
      ))}
    </div>
  );
}

