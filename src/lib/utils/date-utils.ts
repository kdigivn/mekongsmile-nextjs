export const calculateAge = (dob: string): number => {
  const now = new Date();
  const birthDate = new Date(dob);

  const yearsDifference = now.getFullYear() - birthDate.getFullYear();
  const monthsDifference = now.getMonth() - birthDate.getMonth();
  const daysDifference = now.getDate() - birthDate.getDate();

  const totalMonths = yearsDifference * 12 + monthsDifference;

  const floatingPointAge = totalMonths / 12 + daysDifference / 30 / 12;

  return floatingPointAge;
};

export const calculateDuration = (
  departTime?: string,
  arriveTime?: string
): string => {
  if (!departTime || !arriveTime) return "";

  const [departDate, arriveDate] = [
    new Date(`1970-01-01T${departTime}Z`),
    new Date(`1970-01-01T${arriveTime}Z`),
  ];

  const diffMs = arriveDate.getTime() - departDate.getTime();
  if (diffMs < 0) return "";

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffHrs}h ${diffMins}m`;
};
