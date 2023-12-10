import { PlayerRow } from "./components/playerRow/player-row";
import { BUTTONS, CHECKBOXES, SELECT, TABLES } from "./constants/element-ids";
import playerListContext, { type PlayerListContext } from "./context/player";
import profileContext, { type ProfileContext } from "./context/profile";
import { HotKeys } from "./types/hotkeys";
import { Player } from "./types/player";
import { Profile } from "./types/profile";
import { Subscriber } from "./types/subscriber";
import {
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  getRowId,
  manageProfiles,
  saveToClipboard,
  toggleAllCheckboxes,
  toggleTableHeaderCheckbox,
} from "./utils/dom-helpers";

const updateRowDataAfterRefresh = (playerListContext: PlayerListContext) => {
  const list = <HTMLTableElement>document.getElementById(TABLES.PLAYER);
  playerListContext.playerList().forEach((player: Player) => {
    const row = <HTMLTableRowElement>(
      list.querySelector(`#${getRowId(player.rowIndex)}`)
    );
    row.innerHTML = PlayerRow(player);
    setupRow(row, player, playerListContext);
  });
};

const createPlayerRow = (player: Player): HTMLTableRowElement => {
  const row = document.createElement("tr");
  row.id = getRowId(player.rowIndex);
  row.innerHTML = PlayerRow(player);

  return row;
};

const setUpList = (playerListContext: PlayerListContext) => {
  const list = <HTMLTableElement>document.getElementById(TABLES.PLAYER);
  const playerList = playerListContext.playerList();
  playerList.forEach((player: Player) => {
    const row = createPlayerRow(player);
    list.appendChild(row);
    setupRow(row, player, playerListContext);
  });
};

const setupRow = (
  row: HTMLTableRowElement,
  player: Player,
  playerListContext: PlayerListContext
) => {
  const checkbox = <HTMLInputElement>(
    row.querySelector(`#${getCheckboxId(player.rowIndex)}`)
  );
  const textbox = <HTMLInputElement>(
    row.querySelector(`#${getNameFieldId(player.rowIndex)}`)
  );
  const hotkeyTextBox = <HTMLInputElement>(
    row.querySelector(`#${getHotkeyId(player.rowIndex)}`)
  );
  checkbox.addEventListener("change", () => {
    playerListContext.set({
      ...player,
      checked: checkbox.checked,
    });
    toggleTableHeaderCheckbox(playerListContext);
  });
  textbox.addEventListener("keyup", (event: KeyboardEvent) => {
    const name = (<HTMLInputElement>event.target).value;
    checkbox.checked = name.trim() !== "";
    playerListContext.set({
      ...player,
      name,
      checked: checkbox.checked,
    });
  });
  hotkeyTextBox.addEventListener("keyup", (event: KeyboardEvent) => {
    playerListContext.set({
      ...player,
      hotkey: (<HTMLInputElement>event.target).value as HotKeys,
    });
  });
};

const setUpButtons = (playerListContext: PlayerListContext) => {
  (<HTMLInputElement>(
    document.getElementById(CHECKBOXES.TOGGLE_ALL)
  )).addEventListener("click", (event: MouseEvent) => {
    toggleAllCheckboxes(
      (<HTMLInputElement>event.target).checked,
      playerListContext
    );
  });

  (<HTMLButtonElement>(
    document.getElementById(BUTTONS.CLEAR_NAMES)
  )).addEventListener("click", () => {
    playerListContext.resetState();
    updateRowDataAfterRefresh(playerListContext);
  });

  (<HTMLButtonElement>(
    document.getElementById(BUTTONS.COPY_TO_CLIPBOARD)
  )).addEventListener("click", () => saveToClipboard(playerListContext));
};

const initSubscriptions = (playerContext: PlayerListContext) => {
  const subscribers = [
    {
      name: saveToClipboard.name,
      listener: () => saveToClipboard(playerContext),
    },
    {
      name: updateRowDataAfterRefresh.name,
      listener: () => updateRowDataAfterRefresh(playerContext),
      stateToWatch: "profile",
    },
  ];

  subscribers.forEach((subscriber: Subscriber) =>
    playerListContext.subscribe(subscriber)
  );
};

const createProfileOption = (profile: Profile): HTMLOptionElement => {
  const option = document.createElement("option");
  option.id = profile.name;
  option.innerHTML = profile.name;
  option.value = profile.name;

  return option;
};

const setupProfiles = (
  playerContext: PlayerListContext,
  profileContext: ProfileContext
) => {
  const selectProfile = <HTMLSelectElement>(
    document.getElementById(SELECT.PROFILE)
  );
  profileContext.getProfiles().forEach((profile: Profile) => {
    selectProfile.insertBefore(
      createProfileOption(profile),
      selectProfile.firstChild!.nextSibling
    );
    if (profile.active) {
      selectProfile.value = profile.name;
    }
  });
  selectProfile.addEventListener("change", () =>
    manageProfiles(playerContext, profileContext, selectProfile)
  );
};

const main = (
  playerListContext: PlayerListContext,
  profileContext: ProfileContext
) => {
  initSubscriptions(playerListContext);

  document.addEventListener("DOMContentLoaded", () => {
    setUpList(playerListContext);
    setUpButtons(playerListContext);
    setupProfiles(playerListContext, profileContext);
  });
};

main(playerListContext, profileContext);

export {
  createPlayerRow,
  getCheckboxId,
  getNameFieldId,
  initSubscriptions,
  main,
  saveToClipboard,
  setUpButtons,
  setUpList,
  setupRow,
  toggleAllCheckboxes,
};
