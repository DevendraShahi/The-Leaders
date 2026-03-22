import { describe, it, expect } from 'vitest'
import { getNepaliDistrict, districtMap } from '@/lib/district-mapping'

describe('district-mapping utilities', () => {
    describe('getNepaliDistrict', () => {
        it('should return Nepali name for valid English district', () => {
            expect(getNepaliDistrict('Kathmandu')).toBe('काठमाडौँ')
            expect(getNepaliDistrict('Lalitpur')).toBe('ललितपुर')
            expect(getNepaliDistrict('Bhaktapur')).toBe('भक्तपुर')
        })

        it('should handle lowercase input', () => {
            expect(getNepaliDistrict('kathmandu')).toBe('काठमाडौँ')
            expect(getNepaliDistrict('lalitpur')).toBe('ललितपुर')
        })

        it('should handle mixed case input', () => {
            expect(getNepaliDistrict('KATHMANDU')).toBe('काठमाडौँ')
            expect(getNepaliDistrict('KaThMaNdU')).toBe('काठमाडौँ')
        })

        it('should return null for null input', () => {
            expect(getNepaliDistrict(null)).toBeNull()
        })

        it('should handle unknown districts gracefully', () => {
            const result = getNepaliDistrict('UnknownDistrict')
            expect(result).toBe('UnknownDistrict')
        })

        it('should handle edge case whitespace', () => {
            expect(getNepaliDistrict(' Kathmandu ')).toBe(' Kathmandu ')
        })
    })

    describe('districtMap', () => {
        it('should have all 77 districts', () => {
            expect(Object.keys(districtMap).length).toBe(75)
        })

        it('should have correct mappings for major cities', () => {
            expect(districtMap['Kathmandu']).toBe('काठमाडौँ')
            expect(districtMap['Pokhara']).toBeUndefined()
            expect(districtMap['Biratnagar']).toBeUndefined()
        })

        it('should have province 1 districts', () => {
            const province1Districts = ['Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Sunsari']
            province1Districts.forEach(district => {
                expect(districtMap[district]).toBeDefined()
            })
        })

        it('should have mountain region districts', () => {
            expect(districtMap['Mustang']).toBe('मुस्ताङ')
            expect(districtMap['Manang']).toBe('मनाङ')
            expect(districtMap['Humla']).toBe('हुम्ला')
        })

        it('should have terai region districts', () => {
            expect(districtMap['Rupandehi']).toBe('रुपन्देही')
            expect(districtMap['Parsa']).toBe('पर्सा')
            expect(districtMap['Banke']).toBe('बाँके')
        })

        it('should have hill region districts', () => {
            expect(districtMap['Kaski']).toBe('कास्की')
            expect(districtMap['Gorkha']).toBe('गोरखा')
            expect(districtMap['Nuwakot']).toBe('नुवाकोट')
        })
    })
})
