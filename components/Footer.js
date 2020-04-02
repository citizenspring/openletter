import Link from 'next/link';

export default () => (
  <div>
    <center>
      <div>
        <img src="/images/openletter-logo.png" width="64" />
      </div>
      <div>
        <Link href={`/create`}>Create an open letter</Link><br />and co-sign it
    </div>
    </center>
  </div>
);