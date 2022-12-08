const formatTime = (time) => {
  if (typeof time !== "number" || isNaN(time)) {
    return "--:--";
  }
  const duration = Math.floor(Number(time));
  let second = duration % 60;
  let minute = Math.floor(duration / 60);
  let hour = Math.floor(duration / 60 / 60);
  if (second < 10) {
    second = `0${second}`;
  }
  if (minute < 10) {
    minute = `0${minute}`;
  }
  if (hour < 1) {
    return `${minute}:${second}`;
  }
  return `${hour}:${minute}:${second}`;
};

export { formatTime };
