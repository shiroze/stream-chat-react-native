/* eslint-disable no-underscore-dangle */
import {
  convertReactionsToRealm,
  convertReactionCountsToRealm,
  getReactionsFromRealmList,
  getReactionCountsFromRealmList,
} from './ReactionMapper';
import {
  convertAttachmentsToRealm,
  getAttachmentsFromRealmList,
} from './AttachmentMapper';
import { convertUsersToRealm, getUsersFromRealmList } from './UserMapper';

export const convertMessagesToRealm = (messages, realm) =>
  messages.map((m) => convertMessageToRealm(m, realm));

export const convertMessageToRealm = (m, realm) => {
  const {
    id,
    text,
    parent_id,
    command,
    attachments,
    user,
    html,
    type,
    mentioned_users,
    latest_reactions,
    own_reactions,
    reaction_counts,
    show_in_channel,
    reply_count,
    created_at,
    updated_at,
    deleted_at,
    ...extraData
  } = m;
  // reactotron.log('convertMessageToRealm', m);
  const message = {
    id,
    text,
    parent_id,
    command,
    user,
    html,
    type,
    latest_reactions: [...m.latest_reactions],
    own_reactions: [...m.own_reactions],
    mentioned_users: [...m.mentioned_users],
    reaction_counts: { ...m.reaction_counts },
    attachments: [...m.attachments],
    show_in_channel,
    reply_count,
    created_at,
    updated_at,
    deleted_at,
    extraData: JSON.stringify(extraData),
  };

  message.latest_reactions = convertReactionsToRealm(
    message.latest_reactions,
    realm,
  );
  message.own_reactions = convertReactionsToRealm(message.own_reactions, realm);
  message.reaction_counts = convertReactionCountsToRealm(
    message.reaction_counts,
    message.id,
    realm,
  );
  message.mentioned_users = convertUsersToRealm(message.mentioned_users, realm);
  message.attachments = convertAttachmentsToRealm(message.attachments, realm);
  message.user = realm.create('User', message.user, true);
  return realm.create('Message', message, true);
};

export const getMessagesFromRealmList = (ml) => {
  const messages = [];
  for (const m of ml) {
    const extraData = m.extraData ? JSON.parse(m.extraData) : {};
    const message = {
      ...m,
      ...extraData,
    };
    message.attachments = getAttachmentsFromRealmList(message.attachments);
    message.mentioned_users = getUsersFromRealmList(message.mentioned_users);

    message.latest_reactions = getReactionsFromRealmList(
      message.latest_reactions,
    );
    message.own_reactions = getReactionsFromRealmList(message.own_reactions);
    message.reaction_counts = getReactionCountsFromRealmList(
      message.reaction_counts,
    );

    delete message.extraData;
    messages.push(message);
  }

  return messages;
};
