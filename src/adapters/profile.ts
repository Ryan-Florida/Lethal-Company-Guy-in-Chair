import { Profile } from "../types/profile";

export const adaptProfileListFromLocalStorage = (
  storedProfileList: string
): Profile[] => JSON.parse(storedProfileList);

export const adaptProfileListToLocalStorage = (
  profileList: Profile[]
): string => JSON.stringify(profileList);

export const adaptProfileToLocalStorage = (profile: Profile): string =>
  JSON.stringify(profile);

export const adaptProfileFromLocalStorage = (profile: string): Profile =>
  JSON.parse(profile);
