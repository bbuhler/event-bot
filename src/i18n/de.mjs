import { bold, fmt, italic, mention } from 'telegraf/format';
import {
  calendarEmoji, forbiddenEmoji, greenCheckEmoji,
  minusEmoji,
  moveHorizontalEmoji, pencilEmoji, personEmoji, personsEmoji,
  plusEmoji, stopEmoji, thumbsDownEmoji,
  thumbsUpEmoji,
} from '../helpers/emoji.mjs';

const dateFormat = date => new Date(date).toLocaleDateString('de');

export default {
  bot: {
    shortDescription: 'Erstelle Veranstaltungen und teile sie mit anderen, die angeben können, dass sie daran teilnehmen.\n\nhttps://git.io/JCkPz'.substring(0, 120),
    description: `${calendarEmoji} Du kannst mit dem Bot Veranstaltungen erstellten und diese dann in anderen Chats und Gruppen teilen.

${thumbsUpEmoji} Die Chateilnehmer können zu deinen Veranstaltungen zu- oder absagen.

${personsEmoji} Du kannst die Teilnehmer verwalten.

${pencilEmoji} Du kannst den Text & Zeit deiner Veranstaltung verändern oder sie absagen.`.substring(0, 512),
  },
  command: {
    start: {
      reply: (name, botInfo) => fmt`Hallo ${name}!\nIch bin ${botInfo.first_name}. In diesem Chat kannst du mit dem Befehl /create neue Veranstaltungen erstellen und diese dann in anderen Chats oder Gruppen wenn du @${botInfo.username} eingibst teilen. Die Chatteilnehmer können dann zu deiner Veranstaltung zu- oder absagen.`,
    },
    create: {
      description: 'Neue Veranstaltung erstellen',
    },
    help: {
      description: 'Hilfe anzeigen',
    },
    settings: {
      description: 'Einstellungen',
    },
  },
  wizard: {
    create: {
      date: {
        message: 'Wann findet die Veranstaltung statt?',
        reply: (date) => fmt`Alles klar am ${bold(dateFormat(date))}`,
      },
      description: {
        message: 'Als nächstes gib bitte eine Beschreibung für die Veranstaltung ein:',
        reply: 'Falls du die Beschreibung nochmal ändern möchtest, bearbeite einfach deine Nachricht.',
      },
    },
    reschedule: {
      message: 'Auf wann möchtest du die Veranstaltung verschieben?',
      reply: date => fmt`${moveHorizontalEmoji} Alles klar die Veranstaltung wurde auf den ${bold(dateFormat(date))} verschoben.`,
    },
    addParticipant: {
      message: 'Bitte sende oder wähle den Kontakt, den du zur Veranstaltung hinzufügen möchtest',
      button: `${personEmoji} Kontakt auswählen`,
      reply: (name, id) => fmt`${personEmoji} ${mention(name, id)} wurde als Teilnehmer*in hinzugefügt`,
    },
    removeParticipant: {
      message: 'Bitte klicke auf den Teilnehmer, den zu entfernen möchtest',
      reply: (name, id) => fmt`${personEmoji} ${mention(name, id)} wurde als Teilnehmer*in entfernt`,
    },
    cancel: {
      message: 'Bitte bestätige, dass du diese Veranstaltung wirklich absagen möchtest. Das kann nicht Rückgängig gemacht werden.',
      yes: `${greenCheckEmoji} Ja, Veranstaltung absagen`,
      no: `${stopEmoji} Stopp, doch nicht absagen`,
      reply: `${forbiddenEmoji} Veranstaltung wurde abgesagt`,
    },
  },
  action: {
    add: {
      button: `${plusEmoji} Teilnehmer`,
    },
    remove: {
      button: `${minusEmoji} Teilnehmer`,
    },
    reschedule: {
      button: `${moveHorizontalEmoji} Umplanen`,
    },
    cancel: {
      button: `${forbiddenEmoji} Absagen`,
    },
    rsvp: {
      plusOneTip: 'Tipp: Drücke noch einmal für +1',
      participate: {
        button: `${thumbsUpEmoji} Bin dabei`,
        notify: (name, user) => fmt`${personEmoji} ${mention(name, user)} wird teilnehmen`,
      },
      withdraw: {
        button: `${thumbsDownEmoji} Doch nicht`,
        notify: (name, user) => fmt`${personEmoji} ${mention(name, user)} zog die Teilnahme zurück`,
      },
    },
    share: {
      button: 'Teilen',
    },
  },
  inlineQuery: {
    create: {
      button: 'Veranstaltung erstellen',
    },
  },
  message: {
    event: {
      title: (date, canceled) => fmt`${calendarEmoji} ${bold`${canceled ? '[ABGESAGT] ' : ''}${dateFormat(date)}`}`,
      commitments: count => `Zusagen (${count}):`,
      participants: {
        waiting: count => `Warteliste (${count}):`,
        available: limit => italic`${limit} freie Plätze.`,
      },
      canceled: () => fmt`${forbiddenEmoji} ${italic`Veranstaltung wurde abgesagt!`}`,
    },
  },
};