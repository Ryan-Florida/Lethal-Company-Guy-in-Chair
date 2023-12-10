import { Profile } from "../types/profile";
import {
  adaptProfileFromLocalStorage,
  adaptProfileListFromLocalStorage,
  adaptProfileListToLocalStorage,
  adaptProfileToLocalStorage,
} from "./profile";

describe("", () => {
  it("should convert profileList to expected string", () => {
    const expected =
      '[{"name":"default","active":true},{"name":"some other profile","active":false}]';
    const profileList = [
      {
        name: "default",
        active: true,
      },
      {
        name: "some other profile",
        active: false,
      },
    ] as Profile[];

    const result = adaptProfileListToLocalStorage(profileList);

    expect(result).toBe(expected);
  });
  it("should convert profile to expected string", () => {
    const expected = '{"name":"default","active":true}';
    const profile = {
      name: "default",
      active: true,
    } as Profile;

    const result = adaptProfileToLocalStorage(profile);

    expect(result).toBe(expected);
  });
  it("should convert stored string to expected list of Profile objects", () => {
    const expected = [
      {
        name: "default",
        active: true,
      },
      {
        name: "some other profile",
        active: false,
      },
    ] as Profile[];
    const profileListString =
      '[{"name":"default","active":true},{"name":"some other profile","active":false}]';

    const result = adaptProfileListFromLocalStorage(profileListString);

    expect(result).toStrictEqual(expected);
  });
  it("should convert stored string to expected profile", () => {
    const expected = {
      name: "default",
      active: true,
    } as Profile;
    const profileString = '{"name":"default","active":true}';

    const result = adaptProfileFromLocalStorage(profileString);

    expect(result).toBe(expected);
  });
});
