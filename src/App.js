import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";
import Diary from "./Diary";
import "./App.css";

const apiUrl = "http://localhost:3001";

const readFileAsText = (f) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsText(f);
  });
};

const bookingsConflict = (a, b) => {
  const spanA = {
    start: a.time,
    end: a.time + a.duration,
  };

  const spanB = {
    start: b.time,
    end: b.time + b.duration,
  };

  return spanA.start <= spanB.end && spanA.end >= spanB.start;
};

const processBookings = (confirmed, pending) => {
  const c = confirmed.map((b) => ({
    ...b,
    confirmed: true,
    conflicted: false,
  }));

  let p = [];
  if (pending) {
    p = pending.map((booking) => ({
      ...booking,
      confirmed: false,
      conflicted: !!confirmed.find(bookingsConflict.bind(null, booking)),
    }));
  }

  return [...c, ...p];
};

export const App = () => {
  const [bookings, setBookings] = useState([]);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then(processBookings)
      .then(setBookings);
  }, []);

  const onDrop = async (files) => {
    const pending = (
      await Promise.all(
        files.map(async (f) =>
          (await readFileAsText(f))
            .trim()
            .split("\n")
            .slice(1)
            .map((line) => {
              const values = line.split(",");
              return {
                time: new Date(values[0]).getTime(),
                duration: values[1] * 60 * 1000,
                userId: values[2],
              };
            })
        )
      )
    ).flat();
    setBookings(processBookings(bookings, pending));
    setDirty(true);
  };

  const saveChanges = async () => {
    await fetch(`${apiUrl}/bookings`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        bookings.filter((b) => !b.confirmed && !b.conflicted)
      ),
    });

    await fetch(`${apiUrl}/bookings`)
      .then((response) => response.json())
      .then(processBookings)
      .then(setBookings);

    setDirty(false);
  };

  return (
    <div className="App">
      <div className="App-header">
        <Dropzone accept=".csv" onDrop={onDrop}>
          Drag files here
        </Dropzone>
      </div>
      <div className="App-main">
        <Diary bookings={bookings} />
        {dirty && <p>Note: conflicted (red) bookings will not be saved</p>}
        {dirty && <button onClick={saveChanges}>Save/Update</button>}
      </div>
    </div>
  );
};
