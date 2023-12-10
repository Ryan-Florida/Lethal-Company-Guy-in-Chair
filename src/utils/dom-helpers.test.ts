import { localStorageMock } from "../../tests/mocks/local-storage";
import { mockPlayers } from "../../tests/mocks/players";
import { generatePlayerRows } from "../../tests/utils/manage-players.utils";
import { CHECKBOXES, SELECT, TABLES } from "../constants/element-ids";
import { IGNORE_PREFIX } from "../constants/settings";
import { PlayerListContext } from "../context/player";
import DB from "../db/db";
import { initSubscriptions, setUpList } from "../manage-players";
import { Player } from "../types/player";
import {
  addNewProfile,
  fetchHotkeyById,
  getCheckboxId,
  getHotkeyId,
  getNameFieldId,
  getRowId,
  saveToClipboard,
  toggleAllCheckboxes,
} from "./dom-helpers";

describe("Tests for getting IDs", () => {
  it("Should return name field IDs", () => {
    const playerId = 0;
    const expected = "player0_name";
    const result = getNameFieldId(playerId);
    expect(result).toBe(expected);
  });

  it("Should return checkbox ID", () => {
    const playerId = 0;
    const expected = "player0_cb";
    const result = getCheckboxId(playerId);
    expect(result).toBe(expected);
  });

  it("Should return hotkey ID", () => {
    const playerId = 0;
    const expected = "player0_hk";
    const result = getHotkeyId(playerId);
    expect(result).toBe(expected);
  });

  it("Should return row ID", () => {
    const playerId = 0;
    const expected = "player0_row";
    const result = getRowId(playerId);
    expect(result).toBe(expected);
  });
});

describe("Save to clipboard", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    document.body.innerHTML = `
        <table>
            <tbody id="${TABLES.PLAYER}"></tbody>
        </table>
    `;
    const players = [
      ...mockPlayers,
      { name: "ignore me", rowIndex: 6, checked: false },
    ];
    playerContext.setPlayerList(players);
  });

  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("should save values to clipboard", async () => {
    const expected = "Ben\nRyan\nCaleb\nJeff\nIGNOREDPLAYER:ignore me";
    setUpList(playerContext);
    const ignoredCheckbox = <HTMLInputElement>(
      document.querySelector(
        `#${getCheckboxId(playerContext.get("ignore me")?.rowIndex || -1)}`
      )
    );
    // Manually un-check checkbox for "ignore me" player
    ignoredCheckbox.checked = false;
    await saveToClipboard(playerContext);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test toggle all checkboxes", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    playerContext.setPlayerList(mockPlayers);
    document.body.innerHTML = `
      <div>
      ${generatePlayerRows(playerContext.playerList())}
      </div>
    `;
  });

  afterEach(() => {
    localStorageMock.clear();
    playerContext.resetState();
  });

  it("Should Toggle All Checkboxes on and save results to clipboard", () => {
    const expected = playerContext
      .playerList()
      .map((player: Player): string => player.name)
      .filter((name: string): boolean => name !== "")
      .join("\n");
    initSubscriptions(playerContext);
    toggleAllCheckboxes(true, playerContext);
    playerContext.playerList().forEach((player: Player) => {
      const checkbox = <HTMLInputElement>(
        document.querySelector(`#${getCheckboxId(player.rowIndex)}`)
      );
      if (player.name !== "") {
        expect(checkbox.checked).toBe(true);
      }
    });
    const checkbox = <HTMLInputElement>(
      document.querySelector(`#${getCheckboxId(5)}`)
    );
    // The 5th entry in the `players` array is blank
    expect(checkbox.checked).toBe(false);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });

  it("Should Toggle All Checkboxes off and save results to clipboard", () => {
    const expected = playerContext
      .playerList()
      .filter((player: Player): boolean => player.name !== "")
      .map((player: Player): string => `${IGNORE_PREFIX}${player.name}`)
      .join("\n");
    initSubscriptions(playerContext);
    toggleAllCheckboxes(false, playerContext);
    for (let i = 0; i < 5; i++) {
      const checkbox = <HTMLInputElement>(
        document.querySelector(`#${getCheckboxId(i)}`)
      );
      expect(checkbox.checked).toBe(false);
    }
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expected);
  });
});

describe("Test fetching a hotkey", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
  });

  afterEach(() => {
    playerContext.resetState();
    localStorageMock.clear();
  });

  it("should fetch hotkey", () => {
    const testId = 0;
    const expected = "F3";
    DB.write(`player${testId}_hk`, expected);
    const result = fetchHotkeyById(testId, DB);
    expect(result).toBe(expected);
  });

  it("should get a default key", () => {
    const testId = 0;
    const expected = "F1";
    const result = fetchHotkeyById(testId, DB);
    expect(result).toBe(expected);
  });

  it("should get an empty string", () => {
    const testId = -1;
    const expected = "";
    const result = fetchHotkeyById(testId, DB);
    expect(result).toBe(expected);
  });
});

describe("Test toggle table header checkbox", () => {
  let playerContext: PlayerListContext;
  beforeEach(() => {
    playerContext = PlayerListContext.getInstance(DB);
    //@ts-ignore
    global.navigator.clipboard = {
      writeText: jest.fn().mockResolvedValue(undefined),
    };
    playerContext.setPlayerList(mockPlayers);
    document.body.innerHTML = `
      <table>
          <thead>
              <th>#</th>
              <th><input type="checkbox" id="${CHECKBOXES.TOGGLE_ALL}" checked="true" title="Toggle All" /></th>
              <th>Player Name</th>
              <th>HotKey Assignment</th>
          </thead>
          <tbody id="${TABLES.PLAYER}"></tbody>
      </table>
    `;
  });

  afterEach(() => {
    localStorageMock.clear();
    playerContext.resetState();
  });

  it("Should toggle checkbox off", () => {
    setUpList(playerContext);
    let checkbox = <HTMLInputElement>(
      document.getElementById(CHECKBOXES.TOGGLE_ALL)
    );
    expect(checkbox.checked).toBe(true);

    const rowCheckbox = <HTMLInputElement>(
      document.getElementById(
        `${getCheckboxId(playerContext.playerList()[0].rowIndex)}`
      )
    );
    expect(rowCheckbox.checked).toBe(true);
    rowCheckbox.click();
    expect(rowCheckbox.checked).toBe(false);

    checkbox = <HTMLInputElement>document.getElementById(CHECKBOXES.TOGGLE_ALL);
    expect(checkbox.checked).toBe(false);
  });

  it("Should toggle checkbox on", () => {
    setUpList(playerContext);
    // Same as previous test
    let checkbox = <HTMLInputElement>(
      document.getElementById(CHECKBOXES.TOGGLE_ALL)
    );
    expect(checkbox.checked).toBe(true);

    const rowCheckbox = <HTMLInputElement>(
      document.getElementById(
        `${getCheckboxId(playerContext.playerList()[0].rowIndex)}`
      )
    );
    expect(rowCheckbox.checked).toBe(true);
    rowCheckbox.click();
    expect(rowCheckbox.checked).toBe(false);

    checkbox = <HTMLInputElement>document.getElementById(CHECKBOXES.TOGGLE_ALL);
    expect(checkbox.checked).toBe(false);
    //

    rowCheckbox.click();
    expect(rowCheckbox.checked).toBe(true);

    checkbox = <HTMLInputElement>document.getElementById(CHECKBOXES.TOGGLE_ALL);
    expect(checkbox.checked).toBe(true);
  });
});

describe("Test addNewProfile", () => {
  let promptMock: any;

  beforeEach(() => {
    document.body.innerHTML = `
          <div class="header">
              <h3>Guy in Chair Controls</h3>
              <div class="profile-selection">
                  <label for="${SELECT.PROFILE}">Profile Selection:</label>
                  <select id="${SELECT.PROFILE}">
                      <option value="default" id="default">default</option>
                      <option value="add_new" id="add_new">ADD NEW</option>
                  </select>
              </div>
          </div>
        `;

    promptMock = jest.spyOn(window, "prompt");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should add a new profile option to the select element", () => {
    const selectElement = <HTMLSelectElement>(
      document.getElementById(SELECT.PROFILE)
    );
    const newProfileName = "New Profile";
    promptMock.mockReturnValue(newProfileName);

    addNewProfile(selectElement);

    const newElement = <HTMLOptionElement>(
      document.getElementById(newProfileName)
    );

    expect(newElement.textContent).toBe(newProfileName);
    expect(newElement.value).toBe(newProfileName);
    expect(newElement.id).toBe(newProfileName);
    expect(selectElement.value).toBe(newProfileName);
  });

  it("should not add a new profile if prompt is cancelled", () => {
    const selectElement = <HTMLSelectElement>(
      document.getElementById(SELECT.PROFILE)
    );
    promptMock.mockReturnValue(null);

    addNewProfile(selectElement);

    // Check that no new option was added
    expect(selectElement.children.length).toBe(2);
  });
});
