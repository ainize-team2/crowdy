export type locationInfo = {
  name: string,
  address: string,
  latitude: string,
  longitude: string,
  nowStatus: string,
  link: string,
  phonenumber?: string,
  live: boolean,
  allStatus: timeStatus[] | [],
  // 0: Sunday, 6: Saturday (index)
}

export type timeStatus = {
  time: number,
  status: string
}
