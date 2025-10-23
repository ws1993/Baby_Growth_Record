import { defineStore } from 'pinia'

export interface Baby {
  id: string
  name: string
  birthDate: string
  gender: 'boy' | 'girl'
  avatar?: string
  createdAt: string
}

export interface GrowthRecord {
  id: string
  babyId: string
  date: string
  height?: number
  weight?: number
  headCircumference?: number
  notes?: string
  createdAt: string
}

export interface Milestone {
  id: string
  babyId: string
  title: string
  date: string
  description: string
  category: string
  photos?: string[]
  createdAt: string
}

export interface Photo {
  id: string
  babyId: string
  url: string
  caption?: string
  date: string
  createdAt: string
}

export const useBabiesStore = defineStore('babies', {
  state: () => ({
    babies: [] as Baby[],
    growthRecords: [] as GrowthRecord[],
    milestones: [] as Milestone[],
    photos: [] as Photo[]
  }),

  getters: {
    getBabyById: (state) => {
      return (id: string) => state.babies.find(baby => baby.id === id)
    },

    getGrowthRecordsByBabyId: (state) => {
      return (babyId: string) => state.growthRecords
        .filter(record => record.babyId === babyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    getMilestonesByBabyId: (state) => {
      return (babyId: string) => state.milestones
        .filter(milestone => milestone.babyId === babyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    getPhotosByBabyId: (state) => {
      return (babyId: string) => state.photos
        .filter(photo => photo.babyId === babyId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  },

  actions: {
    addBaby(baby: Omit<Baby, 'id' | 'createdAt'>) {
      const newBaby: Baby = {
        ...baby,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      this.babies.push(newBaby)
      this.saveToLocalStorage()
    },

    updateBaby(id: string, updates: Partial<Baby>) {
      const index = this.babies.findIndex(baby => baby.id === id)
      if (index !== -1) {
        this.babies[index] = { ...this.babies[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    deleteBaby(id: string) {
      this.babies = this.babies.filter(baby => baby.id !== id)
      this.growthRecords = this.growthRecords.filter(record => record.babyId !== id)
      this.milestones = this.milestones.filter(milestone => milestone.babyId !== id)
      this.photos = this.photos.filter(photo => photo.babyId !== id)
      this.saveToLocalStorage()
    },

    addGrowthRecord(record: Omit<GrowthRecord, 'id' | 'createdAt'>) {
      const newRecord: GrowthRecord = {
        ...record,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      this.growthRecords.push(newRecord)
      this.saveToLocalStorage()
    },

    updateGrowthRecord(id: string, updates: Partial<GrowthRecord>) {
      const index = this.growthRecords.findIndex(record => record.id === id)
      if (index !== -1) {
        this.growthRecords[index] = { ...this.growthRecords[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    deleteGrowthRecord(id: string) {
      this.growthRecords = this.growthRecords.filter(record => record.id !== id)
      this.saveToLocalStorage()
    },

    addMilestone(milestone: Omit<Milestone, 'id' | 'createdAt'>) {
      const newMilestone: Milestone = {
        ...milestone,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      this.milestones.push(newMilestone)
      this.saveToLocalStorage()
    },

    updateMilestone(id: string, updates: Partial<Milestone>) {
      const index = this.milestones.findIndex(milestone => milestone.id === id)
      if (index !== -1) {
        this.milestones[index] = { ...this.milestones[index], ...updates }
        this.saveToLocalStorage()
      }
    },

    deleteMilestone(id: string) {
      this.milestones = this.milestones.filter(milestone => milestone.id !== id)
      this.saveToLocalStorage()
    },

    addPhoto(photo: Omit<Photo, 'id' | 'createdAt'>) {
      const newPhoto: Photo = {
        ...photo,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      this.photos.push(newPhoto)
      this.saveToLocalStorage()
    },

    deletePhoto(id: string) {
      this.photos = this.photos.filter(photo => photo.id !== id)
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('babyGrowthRecords', JSON.stringify({
        babies: this.babies,
        growthRecords: this.growthRecords,
        milestones: this.milestones,
        photos: this.photos
      }))
    },

    loadFromLocalStorage() {
      const saved = localStorage.getItem('babyGrowthRecords')
      if (saved) {
        const data = JSON.parse(saved)
        this.babies = data.babies || []
        this.growthRecords = data.growthRecords || []
        this.milestones = data.milestones || []
        this.photos = data.photos || []
      }
    }
  }
})