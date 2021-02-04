import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const Container = styled.div`
  border: 1px solid #ccc;
  margin: 2rem;
  overflow: hidden;
  border-radius: 0.5rem;
  position: relative;
`;

const TopHeaders = styled.div`
  display: flex;
  background: #f7f7f7;
  font-size: 0.8rem;
  border-bottom: 2px solid #ccc;
  height: 2rem;
`;

const PrimaryHeader = styled.div`
  padding: 0.5rem 1rem;
  width: 8rem;
  text-align: right;
  border-right: 2px solid #ccc;
  font-weight: bold;
`;

const DateHeader = styled.div`
  width: 8rem;
  padding: 1rem;
  background: #f7f7f7;
  text-align: right;
  font-size: 0.9rem;
  font-style: italic;
  border-right: 2px solid #ccc;
`;

const HourCells = styled.div`
  display: flex;
  flex: 1;
`;

const DateRow = styled.div`
  display: flex;
  border-top: 1px solid #ccc;
  height: 3rem;
  overflow: hidden;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
`;

const HourCell = styled.div`
  flex: 1;
  border-left: 1px solid #ccc;
  width: 3rem;
  white-space: nowrap;
`;

const HourHeaders = styled.div`
  display: flex;
  align-items: space-evenly;
  flex-shrink: 0;
`;

const HourHeader = styled.div`
  flex: 1;
  border-left: 1px solid #ccc;
  padding: 0.5rem;
  width: 3rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: bold;
`;

const Bookings = styled.ol`
  position: absolute;
  top: 2.5rem;
  left: 8rem;
  z-index: 1;
  margin: 0;
  padding: 0;
  overflow: hidden;
  right: 0px;
  bottom: 0px;
  list-style: none;
`;

const Booking = styled.li`
  position: absolute;
  top: ${({ offsetDays }) => {
    return offsetDays * 3;
  }}rem;
  left: ${({ offsetHours }) => {
    return offsetHours * 3;
  }}rem;
  width: ${({ hours }) => {
    return hours * 3;
  }}rem;
  height: 2rem;
  border-radius: 0.5em;
  ${({ booking }) => getBookingStyle(booking)}
  z-index: 2;
  font-size: 0.7em;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getBookingStyle = ({ confirmed, conflicted }) => {
  const status = conflicted
    ? "conflicted"
    : confirmed
    ? "confirmed"
    : "pending";

  switch (status) {
    case "conflicted":
      return `
        //margin-top: 0.5em;
        background: rgba(255, 0, 0, 0.5);
        border: 2px solid rgba(255, 0, 0, 0.5);
      `;
    case "confirmed":
      return `
        background: rgba(50, 109, 168, 0.5);
        border: 2px solid rgba(50, 109, 168, 0.5);
      `;
    default:
      return `
        background: rgba(252, 173, 3, 0.5);
        border: 2px solid rgba(252, 173, 3, 0.5);
      `;
  }
};

const getDays = (start, end) => {
  const days = [];

  const startDate = new Date(start);
  const endDate = new Date(end);

  while (startDate.getDate() <= endDate.getDate()) {
    days.push(
      startDate.toLocaleString("en-AU", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
    );
    startDate.setDate(startDate.getDate() + 1);
  }

  return days;
};

const getHours = (startHour) => {
  const time = new Date();
  time.setHours(startHour);
  const hours = Array(13)
    .fill()
    .map((_, i) => {
      const label = time.toLocaleString("en-US", {
        hour: "numeric",
        hour12: true,
      });
      time.setHours(time.getHours() + 1);
      return label;
    });

  return hours;
};

const Diary = ({ bookings }) => {
  if (bookings.length === 0) {
    return <p>No bookings found</p>;
  }

  const sortedBookings = bookings.slice(0).sort((a, b) => a.time - b.time);

  const startHour = 6;
  const hours = getHours(startHour);

  const days = getDays(
    sortedBookings[0].time,
    sortedBookings[sortedBookings.length - 1].time
  );

  const DAY_MILLIS = 8.64e7;
  const HOUR_MILLIS = 3.6e6;

  return (
    <Container>
      <TopHeaders>
        <PrimaryHeader>Bookings</PrimaryHeader>
        <HourHeaders>
          {hours.map((h) => (
            <HourHeader key={h}>{h}</HourHeader>
          ))}
        </HourHeaders>
      </TopHeaders>
      <Body>
        {days.map((d) => (
          <DateRow key={d}>
            <DateHeader>{d}</DateHeader>
            <HourCells>
              {hours.map((h) => (
                <HourCell key={h} />
              ))}
            </HourCells>
          </DateRow>
        ))}
      </Body>
      <Bookings>
        {sortedBookings.map((b, i) => (
          <Booking
            key={i}
            //key={b.time + "-" + b.userId}
            booking={b}
            conflicted={b.conflicted}
            pending={b.pending}
            hours={b.duration / HOUR_MILLIS}
            // naive rounding for now 1.4999~ = 1 day, 1.5 = 2 days
            offsetDays={Math.round(
              (b.time - sortedBookings[0].time) / DAY_MILLIS,
              10
            )}
            offsetHours={new Date(b.time).getHours() - startHour}
          ></Booking>
        ))}
      </Bookings>
    </Container>
  );
};

Diary.propTypes = {
  bookings: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      conflicted: PropTypes.bool.isRequired,
      confirmed: PropTypes.bool.isRequired,
    })
  ),
};
export default Diary;
