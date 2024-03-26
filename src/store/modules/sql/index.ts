import { defineStore } from 'pinia';
import piniaStore from '@/store/index';
import { TableItem, TabsType } from '@/components/sql/types';
import { TabItem } from './types';

const firstDate = +new Date() + '';

export const useSqlStore = defineStore('sql', {
  state: () => ({
    columns: [],
    tabs: [
      {
        title: 'SQL_1' as string,
        name: firstDate,
        sql: '',
        type: TabsType.Editor,
        node: {} as TableItem,
      } as TabItem,
    ],
    activeTab: firstDate,
    addSqlIsCommand: false,
    historySqls: [] as string[],
    visitNumber: 0,
  }),
  persist: {
    enabled: true,
    strategies: [
      { key: 'tabs', storage: localStorage, paths: ['tabs'] },
      { key: 'activeTabs', storage: localStorage, paths: ['activeTabs'] },
      { key: 'hitorySqls', storage: localStorage, paths: ['historySqls'] },
    ],
  },
  getters: {},
  actions: {
    increamentVisitNumber() {
      this.visitNumber++;
    },
    addHistorySql(sql: string | undefined) {
      sql && this.historySqls.unshift(sql);
    },
    setColumns(columns: any[]) {
      this.columns = columns as never[];
    },
    setCurrentTab(tab: TabItem) {
      const index = this.tabs.findIndex((item) => item.name === tab.name);
      const tabOld = this.tabs[index];
      this.tabs[index] = {
        ...tabOld,
        ...(tab as any),
      };
    },
    addTableTabs(node: TableItem) {
      const currentKey = +new Date() + '';
      this.tabs.push({
        name: currentKey,
        title: node.name,
        sql: '',
        type: TabsType.TableView,
        node: node as any,
      });
      this.activeTab = currentKey;
      return currentKey;
    },
    addEditorTabs(tab: TabItem = {}) {
      this.tabs.push({
        name: +new Date() + '',
        title: `SQL_${this.tabs.length + 1}`,
        sql: '',
        type: TabsType.Editor,
        node: {} as TableItem,
        ...tab,
      });
    },
    removeTabs(index: number) {
      this.tabs.splice(index, 1);
    },
    setActiveTab(val?: string) {
      val && (this.activeTab = val);
    },
    toggleAddSqlIsCommand() {
      this.addSqlIsCommand = !this.addSqlIsCommand;
    },
  },
});

export function useSqlOutsideStore() {
  return useSqlStore(piniaStore);
}
