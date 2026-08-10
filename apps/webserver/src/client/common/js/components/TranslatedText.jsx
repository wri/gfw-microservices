import { useTransifexTranslation } from '../../../hooks/useTransifexTranslation';

function TranslatedText({ text }) {
  const translatedText = useTransifexTranslation(text);

  return <>{translatedText}</>;
}

export default TranslatedText;
