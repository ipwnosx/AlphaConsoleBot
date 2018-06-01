const Discord = require("discord.js");
var fs = require("fs");

module.exports = {
  title: "ready",
  description: "Activated whenever the bot starts",

  run: async (
    client,
    serverInfo,
    sql,
    AllowedLinksSet,
    AutoResponds,
    Commands,
    Events,
    SwearWordsSet,
    blackListedWords
  ) => {
    sql.get(`select * from Statuses where Active = 1`).then(row => {
      if (row) {
        client.user.setActivity(
          row.StatusText.replace(
            "counter",
            client.guilds.get(serverInfo.guildId).memberCount
          ),
          { type: row.StatusType, url: "https://www.twitch.tv/alphaconsole" }
        );
        console.log(
          "Status set to: " +
            row.StatusText.replace(
              "counter",
              client.guilds.get(serverInfo.guildId).memberCount
            )
        );
      }
    });

    sql.all("Select * from DisabledLinks").then(rows => {
      rows.forEach(row => {
        AllowedLinksSet.add(row.ChannelID);
      });
    });

    sql.all("Select * from SwearWords").then(rows => {
      rows.forEach(row => {
        SwearWordsSet.add(row.Word);
      });
    });

    sql.all("Select * from AutoResponds").then(rows => {
      rows.forEach(row => {
        AutoResponds.set(row.Word, row.Response);
      });
    });

    sql.all("Select * from Blacklist").then(rows => {
      rows.forEach(row => {
        blackListedWords.push(row.Word);
      });
    });

    /* client.guilds.get(serverInfo.guildId).channels.get(serverInfo.setTitleChannel).overwritePermissions(message.guild.id, {
        SEND_MESSAGES: true
    });
    client.guilds.get(serverInfo.guildId).channels.get(serverInfo.showcaseChannel).overwritePermissions(message.guild.id, {
        SEND_MESSAGES: true
    });
    client.guilds.get(serverInfo.guildId).channels.get(serverInfo.suggestionsChannel).overwritePermissions(message.guild.id, {
        SEND_MESSAGES: true
    });
    client.guilds.get(serverInfo.guildId).channels.get(serverInfo.setSpecialTitleChannel).overwritePermissions(message.guild.id, {
        SEND_MESSAGES: true
    }); */

    /* client.guilds
      .get(serverInfo.guildId)
      .channels.get(serverInfo.suggestionsChannel)
      .messages.fetch();
    client.guilds
      .get(serverInfo.guildId)
      .channels.get(serverInfo.showcaseChannel)
      .messages.fetch();
    client.guilds
      .get(serverInfo.guildId)
      .channels.get(serverInfo.giveawaychannel)
      .messages.fetch(); */

    serverInfo.logo = client.guilds
      .get(serverInfo.guildId)
      .iconURL({ format: "png" });

    fs.readdir("./src/cmds/", function(err, files) {
      if (err) {
        console.log("Could not list the directory.", err);
      } else {
        files.forEach(function(file, index) {
          if (file.endsWith(".js")) {
            if (require(`../cmds/${file}`).title) {
              Commands[require(`../cmds/${file}`).title] = {
                title: require(`../cmds/${file}`).title,
                perms: require(`../cmds/${file}`).perms,
                commands: require(`../cmds/${file}`).commands,
                desc: require(`../cmds/${file}`).description
              };
            }
          }
        });
      }
    });

    fs.readdir("./src/events/", function(err, files) {
      if (err) {
        console.log("Could not list the directory.", err);
      } else {
        files.forEach(function(file, index) {
          if (file.endsWith(".js")) {
            if (require(`../events/${file}`).title) {
              Events[require(`../events/${file}`).title] = {
                title: require(`../events/${file}`).title,
                desc: require(`../events/${file}`).description
              };
            }
          }
        });
      }
    });

    sql.get("SELECT name FROM sqlite_master WHERE type='table' AND name='partner_types';").then(row => {
      if (!row) sql.run("CREATE TABLE `partner_types` ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, `type` TEXT NOT NULL, `json_data` TEXT NOT NULL )")
    })

    sql.get("SELECT name FROM sqlite_master WHERE type='table' AND name='partners';").then(row => {
      if (!row) sql.run("CREATE TABLE `partners` ( `id` TEXT NOT NULL UNIQUE, `type` TEXT, `partner_name` TEXT, `message_data` TEXT, `header_data` TEXT, `enabled` INTEGER )");
    })

    sql.get("SELECT name FROM sqlite_master WHERE type='table' AND name='titleReports';").then(row => {
      if (!row) sql.run("CREATE TABLE `titleReports` ( `ID` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `DiscordID` TEXT, `SteamID` TEXT, `Title` TEXT, `Color` TEXT, `MessageID` TEXT, `Fixed` INTEGER DEFAULT 0, `Permitted` INTEGER DEFAULT 0, `Reporter` TEXT )");
    })

    /* if (!client.guilds.get(serverInfo.guildId).available) {
      client.users
        .get("136607366408962048")
        .send("**AlphaConsole** guild is disabled according to the API!");
      client.users
        .get("149223090134450177")
        .send("**AlphaConsole** guild is disabled according to the API!");
      } */
    
    //Should be a loop to get them all but I couldn't make it work with it being async... 100 should be enough anyway.
    client.guilds.get(serverInfo.guildId).channels.get(serverInfo.suggestionsChannel).messages.fetch({limit: 100})
    client.guilds.get(serverInfo.guildId).channels.get(serverInfo.partnerChannel).messages.fetch({limit: 100})
    client.guilds.get(serverInfo.guildId).channels.get(serverInfo.titleReporting).messages.fetch({limit: 100})

    console.log("AlphaConsole Bot logged in and ready.");

  }
};
