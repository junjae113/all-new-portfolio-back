import moment from "moment";

export const getCurrentTime = () => {
  const now = moment().format("YYYY-MM-DD HH:mm:ss")
  return now
}