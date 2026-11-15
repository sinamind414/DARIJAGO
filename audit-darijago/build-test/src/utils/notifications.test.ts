import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_VISIBLE_TOASTS,
  dismissToast,
  enqueueToast,
  getDesktopNotificationPermission,
  triggerDesktopNotification,
  type AppToast,
} from './notifications';

test('enqueueToast adds toasts, deduplicates by id, and caps stack at MAX_VISIBLE_TOASTS', () => {
  let list: AppToast[] = [];
  list = enqueueToast(
    list,
    { id: 'ach-1', kind: 'achievement', title: 'First Step', description: 'Desc 1' },
    100
  );
  assert.equal(list.length, 1);

  // Re-adding same id replaces/moves to latest without duplicating
  list = enqueueToast(
    list,
    { id: 'ach-1', kind: 'achievement', title: 'First Step', description: 'Updated' },
    200
  );
  assert.equal(list.length, 1);
  assert.equal(list[0].description, 'Updated');

  list = enqueueToast(
    list,
    { id: 'ach-2', kind: 'achievement', title: 'Five Lessons', description: 'Desc 2' },
    300
  );
  list = enqueueToast(
    list,
    { id: 'goal-1', kind: 'daily-goal', title: 'Goal Reached', description: '50 / 50 XP' },
    400
  );
  list = enqueueToast(
    list,
    { id: 'ach-3', kind: 'achievement', title: '100 XP', description: 'Desc 3' },
    500
  );

  assert.equal(list.length, MAX_VISIBLE_TOASTS);
  assert.deepEqual(
    list.map((t) => t.id),
    ['ach-2', 'goal-1', 'ach-3']
  );
});

test('dismissToast removes target toast cleanly without mutating input array', () => {
  const initial: AppToast[] = [
    { id: 'a', kind: 'achievement', title: 'A', description: '1', createdAt: 1 },
    { id: 'b', kind: 'daily-goal', title: 'B', description: '2', createdAt: 2 },
  ];
  const next = dismissToast(initial, 'a');
  assert.equal(initial.length, 2);
  assert.deepEqual(
    next.map((t) => t.id),
    ['b']
  );
});

test('desktop notification helpers handle missing browser Notification API gracefully', () => {
  assert.equal(getDesktopNotificationPermission(), 'unsupported');
  assert.equal(triggerDesktopNotification('Test', 'Body', 'tag-1'), false);
});
