import {
  adaptProfileListFromLocalStorage,
  adaptProfileListToLocalStorage,
  adaptProfileToLocalStorage,
} from "../adapters/profile";
import DB from "../db/db";
import { DataBase } from "../types/db";
import { Profile } from "../types/profile";

export class ProfileContext {
  private localStorageKeys = {
    PROFILES: "profiles",
    ACTIVE_PROFILE: "activeProfile",
  };
  private static instance: ProfileContext;
  private db: DataBase;
  private activeProfile: Profile;
  private data: Profile[];

  private constructor(DB: DataBase) {
    this.db = DB;
    let storedProfileListString = this.db.get(this.localStorageKeys.PROFILES);

    if (storedProfileListString === null) {
      this.activeProfile = { name: "default", active: true };
      this.data = [this.activeProfile];
      this.publishProfileListToDB();
      this.publishActiveProfileToDB();
    } else {
      this.data = adaptProfileListFromLocalStorage(storedProfileListString);
      this.activeProfile = <Profile>(
        this.data.find((profile: Profile): boolean => profile.active)
      );
    }
  }

  public static getInstance(DB: DataBase): ProfileContext {
    if (!ProfileContext.instance) {
      ProfileContext.instance = new ProfileContext(DB);
    }
    return ProfileContext.instance;
  }

  private publishActiveProfileToDB() {
    this.db.write(
      this.localStorageKeys.ACTIVE_PROFILE,
      adaptProfileToLocalStorage(this.activeProfile)
    );
  }

  private publishProfileListToDB() {
    this.db.write(
      this.localStorageKeys.PROFILES,
      adaptProfileListToLocalStorage(this.data)
    );
  }

  public getProfiles(): Profile[] {
    return this.data;
  }

  public updateProfiles(profile: Profile) {
    if (profile.active) {
      this.data = this.data.map(
        (profile: Profile): Profile => ({ ...profile, active: false })
      );
      this.setActiveProfile(profile);
    }
    this.data.push(profile);
    this.publishProfileListToDB();
  }

  public getActiveProfile(): Profile {
    return this.activeProfile;
  }

  public setActiveProfile(profile: Profile) {
    this.activeProfile = profile;
    this.publishActiveProfileToDB();
    this.data = this.data.map((profile: Profile): Profile => {
      if (profile.active && profile.name !== this.activeProfile.name) {
        return { ...profile, active: false };
      } else if (profile.name === this.activeProfile.name && !profile.active) {
        return this.activeProfile;
      }
      return profile;
    });
    this.publishProfileListToDB();
  }
  //
  // naive pub-sub
  // public subscribe(subscriber: Subscriber) {
  //   this.subscribers.push(subscriber);
  // }

  // public unsubscribe(name: string) {
  //   this.subscribers = this.subscribers.filter(
  //     (subscriber: Subscriber): boolean => subscriber.name !== name
  //   );
  // }

  // private notififyListeners() {
  //   this.subscribers.forEach((subscriber: Subscriber) => subscriber.listener());
  // }

  // // This method is really only for testing
  // public getSubscribers() {
  //   return this.subscribers;
  // }
}

export default ProfileContext.getInstance(DB);
