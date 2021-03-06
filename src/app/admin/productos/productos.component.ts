import { Component, OnInit } from '@angular/core';
import { MysqlService } from './../../services/mysql.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: []
})
export class ProductosComponent implements OnInit {

  public productos = [];
  public inactivos = [];

  public reactivar = 1;

  public tuplaId = null;
  public currentStatus = 1;
  public newProductoForm = new FormGroup({
    id: new FormControl(''),
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    imagen: new FormControl('', Validators.required),
    tipo: new FormControl('', Validators.required),
    minimo: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
    material: new FormControl('', Validators.required),
    precio_venta: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]{1,2})?$')])
  });

  public buscarForm = new FormGroup({
    busqueda: new FormControl('', Validators.required),
  });

  constructor( private mysqlService: MysqlService ) {
    this.newProductoForm.setValue({
      id: '',
      nombre: '',
      descripcion: '',
      imagen: '',
      tipo: '',
      minimo: '',
      material: '',
      precio_venta: ''
    });
    this.buscarForm.setValue({
      busqueda: '',
    });
  }

  ngOnInit(): void {
    document.getElementById('uno').style.display = 'none';
    document.getElementById('dos').style.display = 'none';
    document.getElementById('tres').style.display = 'none';
    this.actualizar();
    this.getInactivos();
  }

  public actualizar() {
    this.mysqlService
      .consulta(`${environment.API_URL}/productos`)
      .subscribe((res: any) => {
        console.log(res);
        this.productos = res.array;
      });
  }

  getInactivos() {
    this.mysqlService
      .consulta(`${environment.API_URL}/productos-inactivos`)
      .subscribe((res: any) => {
        console.log(res);
        this.inactivos = res.array;
      });
  }

  reactivarProductos() {
    if (this.reactivar === 1){
      this.reactivar = 2;
    } else {
      this.reactivar = 1;
    }
  }

  public newProducto(form, tuplaId = this.tuplaId) {
    if (this.newProductoForm.valid) {
      if (this.currentStatus == 1) {
        let data = {
          nombre: form.nombre,
          descripcion: form.descripcion,
          imagen: form.imagen,
          tipo: form.tipo,
          minimo: form.minimo,
          material: form.material,
          precio_venta: form.precio_venta
        };

        this.mysqlService.alta(`${environment.API_URL}/producto`, data)
        .then((laData) => {
          document.getElementById('dos').style.display = 'block';
          setTimeout(() => document.getElementById('dos').style.display = 'none', 5000);
          this.newProductoForm.setValue({
            id: '',
            nombre: '',
            descripcion: '',
            imagen: '',
            tipo: '',
            minimo: '',
            material: '',
            precio_venta: ''
          });
          this.actualizar();
        })
        .catch((err) => {
          console.log(err);
        });

      } else {
        let data = {
          id: tuplaId,
          nombre: form.nombre,
          descripcion: form.descripcion,
          imagen: form.imagen,
          tipo: form.tipo,
          minimo: form.minimo,
          material: form.material,
          precio_venta: form.precio_venta
        };

        this.mysqlService.cambio(`${environment.API_URL}/producto`, data)
          .subscribe((res: any) => {
            console.log(res);
            this.currentStatus = 1;
            this.newProductoForm.setValue({
              id: '',
              nombre: '',
              descripcion: '',
              imagen: '',
              tipo: '',
              minimo: '',
              material: '',
              precio_venta: ''
            });
            document.getElementById('dos').style.display = 'block';
            setTimeout(() => document.getElementById('dos').style.display = 'none', 5000);
            this.actualizar();
          });
      }
    } else {
      document.getElementById('uno').style.display = 'block';
      setTimeout(() => document.getElementById('uno').style.display = 'none', 5000);
    }
  }

  public editProducto(tuplaId) {
    this.mysqlService.consultaId(`${environment.API_URL}/producto/${tuplaId}` )
      .subscribe((res: any) => {
        console.log(res);
        this.currentStatus = 2;
        this.tuplaId = res.id[0].id;
        this.newProductoForm.setValue({
          id: tuplaId,
          nombre: res.id[0].nombre,
          descripcion: res.id[0].descripcion,
          imagen: res.id[0].imagen,
          tipo: res.id[0].tipo.toString(),
          minimo: res.id[0].minimo,
          material: res.id[0].material.toString(),
          precio_venta: res.id[0].precio_venta
        });
      });
  }

  public deleteProducto(tuplaId, estado) {
    const data = {
      id: tuplaId,
      is_active: estado
    };
    this.mysqlService.cambio(`${environment.API_URL}/producto-activacion`, data)
      .subscribe((res: any) => {
        console.log(res);
        this.actualizar();
        this.getInactivos();
        document.getElementById('tres').style.display = 'block';
        setTimeout(() => document.getElementById('tres').style.display = 'none', 5000);
    });
  }

  buscar(form) {
    if (this.buscarForm.valid) {
      this.mysqlService
      .consulta(`${environment.API_URL}/producto-nombre/${form.busqueda}`)
      .subscribe((res: any) => {
        this.productos = res.array;
      });
    } else {
      document.getElementById('cuatro').style.display = 'block';
      setTimeout(() => document.getElementById('cuatro').style.display = 'none', 5000);
    }
  }

  cerrar(alerta: string) {
    document.getElementById(alerta).style.display = 'none';
  }
}
