import { Document, Page, Image, Text, View, StyleSheet } from '@react-pdf/renderer';

interface Tarjeta {
  numero_tarjeta: string;
  cliente_nombre?: string;
  vehiculo_nombre?: string;
  codigo_canal?: string;
  created_at: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: 10,
  },
  canalText: {
    fontSize: 12,
    color: '#000000',
    left: 30,
    top: 20,
    position: 'absolute',
  },
  numberText: {
    fontSize: 12,
    color: '#000000',
    left: 10,
    bottom: 25,
    position: 'absolute',
  },
  nameText: {
    fontSize: 12,
    color: '#000000',
    left: 10,
    bottom: 10,
    fontWeight: 'bold',
    position: 'absolute',
  },
  issuanceText: {
    fontSize: 10,
    color: '#000000',
    left: 10,
    top: 140,
    textAlign: 'right',
    position: 'absolute',
  },
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const TarjetaPDF = ({ tarjeta }: { tarjeta: Tarjeta }) => (
  <Document>
    {/* Página frontal */}
    <Page size={[291, 183]} style={styles.page}>
      <Image src="/images/logo-max-card.png" style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.canalText}>{tarjeta.codigo_canal || 'N/A'}</Text>
        <Text style={styles.numberText}>{tarjeta.numero_tarjeta}</Text>
        <Text style={styles.nameText}>
          {tarjeta.cliente_nombre || tarjeta.vehiculo_nombre || 'No asociado'}
        </Text>
      </View>
    </Page>

    {/* Página trasera */}
    <Page size={[291, 183]} style={styles.page}>
      <Image src="/images/logo-max-back.png" style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.issuanceText}>
          {`Emitida: ${formatDate(tarjeta.created_at)}`}
        </Text>
      </View>
    </Page>
  </Document>
);

export default TarjetaPDF;
