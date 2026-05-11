import { createEmailContent } from './emailContent';

describe('createEmailContent', () => {
  describe('finish', () => {
    const baseFilter = { listName: 'Acme', location: 'https://example.com/download' };

    it.each(['Post-2000', 'Post-2020', 'Alerts', 'GHG', 'Palm Risk'])(
      'prepends %s to the body when analysisType is set',
      (analysisType) => {
        const content = createEmailContent('finish', { ...baseFilter, analysisType });

        expect(content.body[0]).toContain(`${analysisType} analysis file for`);
        expect(content.body[0]).toContain('Acme');
        expect(content.cta?.href).toBe('https://example.com/download');
      }
    );

    it('falls back to "File for" when analysisType is omitted', () => {
      const content = createEmailContent('finish', baseFilter);

      expect(content.body[0]).toContain('File for');
      expect(content.body[0]).not.toContain('analysis file for');
      expect(content.body[0]).toContain('Acme');
    });

    it('falls back to "File for" when analysisType is an empty string', () => {
      const content = createEmailContent('finish', { ...baseFilter, analysisType: '' });

      expect(content.body[0]).toContain('File for');
      expect(content.body[0]).not.toContain('analysis file for');
    });
  });
});
