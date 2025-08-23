import { AbilityBuilder, PureAbility, createMongoAbility, MongoAbility } from '@casl/ability';
import { Action, Subject, Role, User } from '@edgenetiq/shared-types';

export type AppAbility = MongoAbility<[Action, Subject]>;

// Define roles and their permissions
export const ROLES: Record<string, Role> = {
  FleetAdmin: {
    name: 'FleetAdmin',
    permissions: [
      { action: 'manage', subject: 'all' }, // Full access to everything
    ],
  },
  ShipIT: {
    name: 'ShipIT',
    permissions: [
      { action: 'read', subject: 'asset' },
      { action: 'write', subject: 'asset', conditions: { shipId: { $in: ['{{user.shipIds}}'] } } },
      { action: 'read', subject: 'ship', conditions: { id: { $in: ['{{user.shipIds}}'] } } },
      { action: 'read', subject: 'calendar' },
      { action: 'write', subject: 'calendar', conditions: { shipIds: { $in: ['{{user.shipIds}}'] } } },
      { action: 'read', subject: 'lifecycle' },
      { action: 'write', subject: 'lifecycle', conditions: { 'asset.shipId': { $in: ['{{user.shipIds}}'] } } },
      { action: 'read', subject: 'compliance' },
    ],
  },
  Security: {
    name: 'Security',
    permissions: [
      { action: 'read', subject: 'asset' },
      { action: 'read', subject: 'ship' },
      { action: 'manage', subject: 'compliance' },
      { action: 'read', subject: 'calendar' },
      { action: 'write', subject: 'calendar', conditions: { eventType: { $in: ['audit', 'incident'] } } },
      { action: 'read', subject: 'lifecycle' },
    ],
  },
  LicenseOwner: {
    name: 'LicenseOwner',
    permissions: [
      { action: 'read', subject: 'asset' },
      { action: 'read', subject: 'ship' },
      { action: 'manage', subject: 'license' },
      { action: 'manage', subject: 'contract' },
      { action: 'read', subject: 'calendar' },
      { action: 'write', subject: 'calendar', conditions: { eventType: { $in: ['maintenance', 'upgrade'] } } },
    ],
  },
  Viewer: {
    name: 'Viewer',
    permissions: [
      { action: 'read', subject: 'asset' },
      { action: 'read', subject: 'ship' },
      { action: 'read', subject: 'calendar' },
      { action: 'read', subject: 'lifecycle' },
      { action: 'read', subject: 'compliance' },
      { action: 'read', subject: 'license' },
      { action: 'read', subject: 'contract' },
    ],
  },
};

export function createAbilityFor(user: User): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  // Process each role the user has
  for (const roleName of user.roles) {
    const role = ROLES[roleName];
    if (!role) continue;

    for (const permission of role.permissions) {
      let conditions = permission.conditions;
      
      // Replace template variables in conditions
      if (conditions) {
        conditions = replaceTemplateVariables(conditions, user);
      }

      can(permission.action, permission.subject, conditions);
    }
  }

  return build();
}

function replaceTemplateVariables(conditions: any, user: User): any {
  const conditionsStr = JSON.stringify(conditions);
  const replaced = conditionsStr.replace(/\{\{user\.(\w+)\}\}/g, (match, property) => {
    const value = (user as any)[property];
    return JSON.stringify(value);
  });
  return JSON.parse(replaced);
}

export function checkPermission(ability: AppAbility, action: Action, subject: Subject, resource?: any): boolean {
  return ability.can(action, subject, resource);
}

export function requirePermission(ability: AppAbility, action: Action, subject: Subject, resource?: any): void {
  if (!checkPermission(ability, action, subject, resource)) {
    throw new Error(`Access denied: Cannot ${action} ${subject}`);
  }
}

// Helper functions for common checks
export function canReadAsset(ability: AppAbility, asset: any): boolean {
  return checkPermission(ability, 'read', 'asset', asset);
}

export function canWriteAsset(ability: AppAbility, asset: any): boolean {
  return checkPermission(ability, 'write', 'asset', asset);
}

export function canDeleteAsset(ability: AppAbility, asset: any): boolean {
  return checkPermission(ability, 'delete', 'asset', asset);
}

export function canReadShip(ability: AppAbility, ship: any): boolean {
  return checkPermission(ability, 'read', 'ship', ship);
}

export function canWriteShip(ability: AppAbility, ship: any): boolean {
  return checkPermission(ability, 'write', 'ship', ship);
}

export function canReadCalendar(ability: AppAbility, event?: any): boolean {
  return checkPermission(ability, 'read', 'calendar', event);
}

export function canWriteCalendar(ability: AppAbility, event: any): boolean {
  return checkPermission(ability, 'write', 'calendar', event);
}

export function canDeleteCalendar(ability: AppAbility, event: any): boolean {
  return checkPermission(ability, 'delete', 'calendar', event);
}

export function canManageCompliance(ability: AppAbility, control?: any): boolean {
  return checkPermission(ability, 'manage', 'compliance', control);
}

export function canManageLicense(ability: AppAbility, license?: any): boolean {
  return checkPermission(ability, 'manage', 'license', license);
}

export function canManageContract(ability: AppAbility, contract?: any): boolean {
  return checkPermission(ability, 'manage', 'contract', contract);
}

// Middleware helper for Express/NestJS
export interface AuthenticatedUser extends User {
  ability: AppAbility;
}

export function attachAbility(user: User): AuthenticatedUser {
  const ability = createAbilityFor(user);
  return { ...user, ability };
}

// Filter functions for lists based on permissions
export function filterAssetsByPermission(ability: AppAbility, assets: any[], action: Action = 'read'): any[] {
  return assets.filter(asset => checkPermission(ability, action, 'asset', asset));
}

export function filterShipsByPermission(ability: AppAbility, ships: any[], action: Action = 'read'): any[] {
  return ships.filter(ship => checkPermission(ability, action, 'ship', ship));
}

export function filterCalendarEventsByPermission(ability: AppAbility, events: any[], action: Action = 'read'): any[] {
  return events.filter(event => checkPermission(ability, action, 'calendar', event));
}

export { Action, Subject, Role, User };