import { bold, fmt, italic, mention } from 'telegraf/format';
import {
  calendarEmoji,
  forbiddenEmoji, greenCheckEmoji,
  minusEmoji,
  moveHorizontalEmoji, pencilEmoji, personEmoji, personsEmoji,
  plusEmoji, stopEmoji, thumbsDownEmoji,
  thumbsUpEmoji,
} from '../helpers/emoji.mjs';

const dateFormat = date => new Date(date).toLocaleDateString('en');

export default {
  bot: {
    shortDescription: 'Create events and share them with others, who can state that they participate in your event.\n\nhttps://git.io/JCkPz'.substring(0, 120),
    description: `${calendarEmoji} You can create events with the bot and then share them in other chats and groups.

${thumbsUpEmoji} The chat participants can accept/reject your invitations.

${personsEmoji} You can manage the participants.

${pencilEmoji} You can change the text & time of your event or cancel it.`.substring(0, 512),
  },
  command: {
    start: {
      reply: (name, botInfo) => fmt`Hello ${name}!\nI am ${botInfo.first_name}. In this chat you can create new events with the command /create and share them in other chats or groups by typing @${botInfo.username}. Chat participants can then state that they would like to participate in your event.`,
    },
    create: {
      description: 'Create a new event',
    },
    help: {
      description: 'Show help',
    },
    settings: {
      description: 'Settings',
    },
  },
  wizard: {
    create: {
      date: {
        message: 'When will the event take place?',
        reply: (date) => fmt`All right on ${bold(dateFormat(date))}`,
      },
      description: {
        message: 'Next, please enter a description for the event:',
        reply: 'If you want to change the description again, just edit your message.',
      },
    },
    reschedule: {
      message: 'When do you want to reschedule the event to?',
      reply: date => fmt`${moveHorizontalEmoji} All right the event has been rescheduled to the ${bold(dateFormat(date))}`,
    },
    addParticipant: {
      message: 'Please attach or select the contact you want to add to the event.',
      button: `${personEmoji} Select contact`,
      reply: (name, id) => fmt`${personEmoji} ${mention(name, id)} has been added as participant`,
    },
    removeParticipant: {
      message: 'Please click the participant you want to remove from the event.',
      reply: (name, id) => fmt`${personEmoji} ${mention(name, id)} has been removed as participant`,
    },
    cancel: {
      message: 'Please confirm that you really want to cancel the event. This action can not be undone.',
      yes: `${greenCheckEmoji} Yes, cancel the event`,
      no: `${stopEmoji} Stop, don't cancel after all`,
      reply: `${forbiddenEmoji} Event has been canceled`,
    },
  },
  action: {
    add: {
      button: `${plusEmoji} Participant`,
    },
    remove: {
      button: `${minusEmoji} Participant`,
    },
    reschedule: {
      button: `${moveHorizontalEmoji} Reschedule`,
    },
    cancel: {
      button: `${forbiddenEmoji} Cancel`,
    },
    rsvp: {
      plusOneTip: 'Tip: press again to add a +1',
      participate: {
        button: `${thumbsUpEmoji} I'm in`,
        notify: (name, user) => fmt`${personEmoji} ${mention(name, user)} will participate`,
      },
      withdraw: {
        button: `${thumbsDownEmoji} I can't`,
        notify: (name, user) => fmt`${personEmoji} ${mention(name, user)} withdrew participation`,
      },
    },
    share: {
      button: 'Share',
    },
  },
  inlineQuery: {
    create: {
      button: 'Create event',
    },
  },
  message: {
    event: {
      title: (date, canceled) => fmt`${calendarEmoji} ${bold`${canceled ? '[CANCELED] ' : ''}${date}`}`,
      commitments: count => `Participants (${count}):`,
      participants: {
        waiting: count => `Waiting list (${count}):`,
        available: limit => italic`${limit} free places.`,
      },
      canceled: () => fmt`${forbiddenEmoji} ${italic`Event was canceled!`}`,
    },
  },
};